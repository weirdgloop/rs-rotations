<script>
    import { onMount, onDestroy } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import '../../css/colors.css';
    import { Logger, LogCategory } from '../../lib/utils/Logger';
    
    const logger = Logger.getInstance();
    
    // Register all Chart.js components
    Chart.register(...registerables);
    
    import { abils } from '$lib/data/abilities.ts';
    import { familiars } from '$lib/data/familiars';
    import { STYLE_COLORS, ABILITY_COLORS, DAMAGE_SOURCE_COLORS, getDamageColour } from '../../lib/utils/colors';

    export let distributionStats = [];
    export let totalDamage = 0;
    export let poisonDamage = 0;
    export let familiarDamage = 0;
    export let dreadnipDamage = 0;
    export let conjureDamage = 0;
    export let poisonPerTick = [];
    export let familiarPerTick = [];
    export let dreadnipPerTick = [];
    export let conjurePerTick = [];
    export let allAbils = {};
    export let familiarKey = 'none';
    export let familiarVariancePerTick = [];
    export let dreadnipVariancePerTick = [];
    export let conjureVariancePerTick = [];
    export let phaseTransitions = [];
    export let barSize = 0;
    export let patternStartTick = -1;
    export let hasBossPreset = false;

    // Which chart is expanded (null = all thumbnails, 'timeline' | 'breakdown' | 'distribution')
    let expandedChart = null;

    // Calculate DPM reactively for thumbnail display
    $: thumbnailDpm = (() => {
        const allDmg = totalDamage + poisonDamage + familiarDamage + dreadnipDamage + conjureDamage;
        if (allDmg <= 0 || !distributionStats?.length) return 0;
        // Use the last tick that has a damage event, matching the in-chart calculation
        const lastTick = Math.max(...distributionStats.map(s => s.tick), 1);
        const startTick = patternStartTick > 0 ? patternStartTick : 0;
        const pauseTicks = (phaseTransitions || [])
            .filter(pt => pt.tick >= startTick && pt.tick <= lastTick)
            .reduce((sum, pt) => sum + (pt.pause || 0), 0);
        const activeTicks = lastTick - startTick - pauseTicks;
        const seconds = activeTicks * 0.6;
        return seconds > 0 ? Math.round(allDmg / seconds * 60) : 0;
    })();

    // Calculate confidence intervals
    // Depend on all damage sources so Gaussian params recalculate when any change
    let gaussianParams = { mean: 0, stdDev: 0 };
    $: {
        // Touch reactive dependencies
        poisonDamage; familiarDamage; dreadnipDamage; conjureDamage;
        familiarVariancePerTick; dreadnipVariancePerTick; conjureVariancePerTick;
        gaussianParams = calculateGaussianParameters(distributionStats);
    }
    $: confidence95 = gaussianParams.stdDev > 0 ? {
        lower: Math.round(gaussianParams.mean - 2 * gaussianParams.stdDev),
        upper: Math.round(gaussianParams.mean + 2 * gaussianParams.stdDev)
    } : null;
    $: confidence997 = gaussianParams.stdDev > 0 ? {
        lower: Math.round(gaussianParams.mean - 3 * gaussianParams.stdDev),
        upper: Math.round(gaussianParams.mean + 3 * gaussianParams.stdDev)
    } : null;
    
    let chartCanvas;
    let chart;
    let timeSeriesCanvas;
    let timeSeriesChart;
    let breakdownCanvas;
    let breakdownChart;

    const formatDmg = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 100000) return (num / 1000).toFixed(0) + 'K';
        return num.toLocaleString();
    };

    // Merged style + damage source colours for chart lookups
    const STYLE_COLOURS = { ...STYLE_COLORS, ...DAMAGE_SOURCE_COLORS };

    /**
     * Derive the parent ability key from a sub-hit key.
     * e.g. 'assault hit' -> 'assault', 'rapid fire last hit' -> 'rapid fire'
     */
    function getParentKey(hitKey) {
        for (const suffix of [' last hit', ' hit', ' scroll', ' auto']) {
            if (hitKey.endsWith(suffix)) return hitKey.slice(0, -suffix.length);
        }
        // Numeric suffixes like 'snap shot 1'
        const numMatch = hitKey.match(/^(.+?)\s+\d+$/);
        if (numMatch) return numMatch[1];
        return hitKey;
    }

    function getDisplayName(parentKey) {
        if (allAbils[parentKey]?.title) return allAbils[parentKey].title;
        if (allAbils[parentKey.toLowerCase()]?.title) return allAbils[parentKey.toLowerCase()].title;
        // Capitalise each word as fallback
        return parentKey.replace(/\b\w/g, l => l.toUpperCase());
    }

    function getIconPath(key) {
        if (allAbils[key]?.icon) return allAbils[key].icon;
        // Ability keys are lowercase — try that too
        const lower = key.toLowerCase();
        if (allAbils[lower]?.icon) return allAbils[lower].icon;
        // getParentKey may have stripped a suffix — try common hit-key variants
        for (const suffix of [' hit', ' last hit']) {
            if (allAbils[key + suffix]?.icon) return allAbils[key + suffix].icon;
            if (allAbils[lower + suffix]?.icon) return allAbils[lower + suffix].icon;
        }
        // Familiar icon — match by familiar name
        const fam = (familiarKey && familiarKey !== 'none') ? familiars[familiarKey] : null;
        if (fam && fam.name === key) return fam.scroll_icon || fam.icon;
        // Poison (not yet in distributionStats)
        if (key === '_poison') return '/effect_icons/poison.png';
        return null;
    }

    // Cache loaded images for the breakdown chart icons
    const iconCache = {};
    function loadIcon(src) {
        if (iconCache[src]) return iconCache[src];
        const img = new Image();
        img.src = src;
        iconCache[src] = img;
        return img;
    }

    function getAbilityStyle(hitKey) {
        const style = abils[hitKey]?.mainStyle || abils[hitKey.toLowerCase()]?.mainStyle;
        if (style) return style;
        // Try parent key
        const parent = getParentKey(hitKey);
        return abils[parent]?.mainStyle || abils[parent.toLowerCase()]?.mainStyle || 'unknown';
    }

    function buildBreakdownData() {
        const groups = {};

        // Group ability hits by parent key
        for (const stat of distributionStats) {
            const parent = getParentKey(stat.ability);
            if (!groups[parent]) {
                groups[parent] = { damage: 0, style: stat.source || getAbilityStyle(stat.ability) };
            }
            let expected;
            if (stat.distributionType === 'combined' && stat.critProbability !== undefined) {
                expected = stat.critProbability * stat.critMean + (1 - stat.critProbability) * stat.nonCritMean;
            } else {
                expected = (stat.minDamage + stat.maxDamage) / 2;
            }
            groups[parent].damage += expected * stat.likelihood;
        }

        // Add secondary damage sources not yet in distributionStats
        if (poisonDamage > 0) groups['_poison'] = { damage: poisonDamage, style: 'poison' }; //TODO migrate

        // Sort by damage descending
        const sorted = Object.entries(groups)
            .map(([key, val]) => ({
                key,
                label: key.startsWith('_') ? key.slice(1).replace(/\b\w/g, l => l.toUpperCase()) : getDisplayName(key),
                damage: Math.round(val.damage),
                colour: ABILITY_COLORS[key] || STYLE_COLOURS[val.style] || STYLE_COLOURS.unknown,
                icon: getIconPath(key)
            }))
            .sort((a, b) => b.damage - a.damage);

        return sorted;
    }

    function updateBreakdownChart() {
        if (!breakdownCanvas) return;
        const data = buildBreakdownData();
        if (data.length === 0) return;

        const grandTotal = data.reduce((sum, d) => sum + d.damage, 0);
        const iconSize = 20;

        // Preload all icons
        const icons = data.map(d => d.icon ? loadIcon(d.icon) : null);

        if (breakdownChart) breakdownChart.destroy();

        // Plugin to draw icons next to Y-axis labels
        const iconPlugin = {
            id: 'breakdownIcons',
            afterDraw(chart) {
                const { ctx, scales } = chart;
                const yScale = scales.y;
                if (!yScale) return;

                data.forEach((d, i) => {
                    const img = icons[i];
                    if (!img || !img.complete || !img.naturalWidth) return;

                    const y = yScale.getPixelForTick(i);
                    // Draw icon to the left of the label area
                    const x = yScale.left - iconSize - 4;
                    ctx.drawImage(img, x, y - iconSize / 2, iconSize, iconSize);
                });
            }
        };

        // Wait for icons to load before first render
        const pending = icons.filter(img => img && !img.complete);
        if (pending.length > 0) {
            let loaded = 0;
            const onLoad = () => {
                loaded++;
                if (loaded >= pending.length && breakdownChart) {
                    breakdownChart.draw();
                }
            };
            pending.forEach(img => img.addEventListener('load', onLoad, { once: true }));
        }

        const ctx = breakdownCanvas.getContext('2d');
        breakdownChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.damage),
                    backgroundColor: data.map(d => d.colour),
                    borderColor: data.map(d => d.colour),
                    borderWidth: 1,
                    borderRadius: 3
                }]
            },
            plugins: [iconPlugin],
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { left: iconSize + 8 }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Damage Breakdown by Source',
                        color: '#fff',
                        font: { size: 14 }
                    },
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const dmg = ctx.parsed.x;
                                const pct = ((dmg / grandTotal) * 100).toFixed(1);
                                return `${formatDmg(dmg)} (${pct}%)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Expected Damage', color: '#fff' },
                        ticks: {
                            color: '#fff',
                            callback: (value) => formatDmg(value)
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#fff', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    function toggleChart(name) {
        expandedChart = expandedChart === name ? null : name;
        // Rebuild chart after DOM updates when expanding
        if (expandedChart) {
            setTimeout(() => {
                if (expandedChart === 'timeline') updateTimeSeriesChart();
                else if (expandedChart === 'breakdown') updateBreakdownChart();
                else if (expandedChart === 'distribution') updateChart();
            }, 0);
        }
    }
    
    // Calculate Gaussian parameters for TOTAL damage (sum of all hits)
    function calculateGaussianParameters(stats) {
        logger.log(LogCategory.ROTATION, 'calculateGaussianParameters called with stats', stats);
        if (stats.length === 0) {
            logger.log(LogCategory.ROTATION, 'No stats provided, returning default values');
            return { mean: 0, stdDev: 0 };
        }

        // Calculate total mean and variance (sum of all hits)
        let totalMean = 0;
        let totalVariance = 0;

        stats.forEach(stat => {
            if (stat.distributionType === 'combined') {
                // For combined distributions, calculate the proper mixture mean and variance
                // Mixture mean = p1*mu1 + p2*mu2
                // Mixture variance = p1*sigma1^2 + p2*sigma2^2 + p1*p2*(mu1-mu2)^2
                
                const p1 = stat.critProbability;
                const mu1 = stat.critMean;
                const sigma1Squared = stat.critVariance;
                const p2 = stat.nonCritProbability;
                const mu2 = stat.nonCritMean;
                const sigma2Squared = stat.nonCritVariance;
                
                const mixtureMean = p1 * mu1 + p2 * mu2;
                const mixtureVariance = p1 * sigma1Squared + p2 * sigma2Squared + p1 * p2 * Math.pow(mu1 - mu2, 2);
                
                // Add to total (each ability contributes to the sum)
                totalMean += mixtureMean * stat.likelihood;
                totalVariance += mixtureVariance * stat.likelihood;
            } else if (stat.distributionType === 'crit' || stat.distributionType === 'non_crit') {
                // For individual crit/non-crit distributions, treat as independent
                const meanDamage = (stat.minDamage + stat.maxDamage) / 2;
                const variance = Math.pow((stat.maxDamage - stat.minDamage) / 2, 2) / 3;
                
                // Add to total (each hit contributes to the sum)
                totalMean += meanDamage * stat.likelihood;
                totalVariance += variance * stat.likelihood;
            }
        });

        // Add poison mean (expected value) TODO poisonvariance?
        totalMean += poisonDamage;

        const stdDev = Math.sqrt(totalVariance);

        return { mean: totalMean, stdDev };
    }
    
    // Create histogram data for TOTAL damage distribution
    function createHistogramData(stats, gaussianParams) {
        logger.log(LogCategory.ROTATION, 'createHistogramData called', { stats, gaussianParams });
        if (stats.length === 0) {
            logger.log(LogCategory.ROTATION, 'No stats provided to createHistogramData');
            return { labels: [], data: [], cumulativeData: [] };
        }
        
        if (gaussianParams.stdDev === 0) {
            logger.log(LogCategory.ROTATION, 'Standard deviation is 0, returning empty data');
            return { labels: [], data: [], cumulativeData: [] };
        }
        
        // Create range around the total damage mean (±4 standard deviations)
        const rangeStart = Math.max(0, gaussianParams.mean - 4 * gaussianParams.stdDev);
        const rangeEnd = gaussianParams.mean + 4 * gaussianParams.stdDev;
        
        // Calculate nice round tick spacing for labels
        const range = rangeEnd - rangeStart;
        let tickSpacing = range / 10; // Aim for ~10 ticks
        
        // Round tick spacing to nice numbers
        const magnitude = Math.pow(10, Math.floor(Math.log10(tickSpacing)));
        const normalized = tickSpacing / magnitude;
        
        if (normalized < 2) tickSpacing = magnitude;
        else if (normalized < 5) tickSpacing = 2 * magnitude;
        else if (normalized < 10) tickSpacing = 5 * magnitude;
        else tickSpacing = 10 * magnitude;
        
        // Adjust range to use nice round numbers
        const adjustedRangeStart = Math.floor(rangeStart / tickSpacing) * tickSpacing;
        const adjustedRangeEnd = Math.ceil(rangeEnd / tickSpacing) * tickSpacing;
        const numTicks = Math.ceil((adjustedRangeEnd - adjustedRangeStart) / tickSpacing) + 1;
        
        // Create many more data points for smooth curves (200 points instead of ~10)
        const numDataPoints = 200;
        const dataPointSpacing = (adjustedRangeEnd - adjustedRangeStart) / (numDataPoints - 1);
        
        // Create data points for the Gaussian curve
        const dataPoints = [];
        const cumulativeData = [];
        const labels = [];
        
        // Create smooth curve data points
        for (let i = 0; i < numDataPoints; i++) {
            const x = adjustedRangeStart + i * dataPointSpacing;
            const gaussianValue = (1 / (gaussianParams.stdDev * Math.sqrt(2 * Math.PI))) * 
                                 Math.exp(-0.5 * Math.pow((x - gaussianParams.mean) / gaussianParams.stdDev, 2));
            dataPoints.push(gaussianValue);
            
            // Create labels for each data point (Chart.js needs labels array to match data array length)
            const formatNumber = (num) => {
                if (num >= 1000000) {
                    return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 100000) {
                    return (num / 1000).toFixed(0) + 'K';
                } else {
                    return num.toLocaleString();
                }
            };
            
            // Show labels at consistent intervals (every 20th point for ~10 labels across 200 points)
            const labelInterval = Math.floor(numDataPoints / numTicks);
            const isTickPoint = i % labelInterval === 0;
            labels.push(isTickPoint ? formatNumber(x) : '');
        }
        
        // Calculate cumulative probability (probability of achieving at least this damage)
        let cumulativeSum = 0;
        for (let i = dataPoints.length - 1; i >= 0; i--) {
            cumulativeSum += dataPoints[i] * dataPointSpacing; // Multiply by spacing to get area
            cumulativeData.unshift(cumulativeSum);
        }
        
        // Scale probability density to a reasonable range (0-50 instead of 0-100)
        const maxValue = Math.max(...dataPoints);
        const scaledData = dataPoints.map(point => (point / maxValue) * 50);
        
        // Normalize cumulative data to 0-100
        const maxCumulative = Math.max(...cumulativeData);
        const scaledCumulative = cumulativeData.map(point => (point / maxCumulative) * 100);
        
        return { 
            labels, 
            data: scaledData,
            cumulativeData: scaledCumulative
        };
    }
    
    function updateChart() {
        if (!chartCanvas) return;
        
        // Destroy existing chart
        if (chart) {
            chart.destroy();
        }
        
        const ctx = chartCanvas.getContext('2d');
        
        // Calculate Gaussian parameters
        const gaussianParams = calculateGaussianParameters(distributionStats);
        
        // Create histogram data
        const histogramData = createHistogramData(distributionStats, gaussianParams);
        
        // Create vertical lines for mean and standard deviations
        const rangeStart = Math.max(0, gaussianParams.mean - 4 * gaussianParams.stdDev);
        const rangeEnd = gaussianParams.mean + 4 * gaussianParams.stdDev;
        const range = rangeEnd - rangeStart;
        let tickSpacing = range / 10;
        const magnitude = Math.pow(10, Math.floor(Math.log10(tickSpacing)));
        const normalized = tickSpacing / magnitude;
        if (normalized < 2) tickSpacing = magnitude;
        else if (normalized < 5) tickSpacing = 2 * magnitude;
        else if (normalized < 10) tickSpacing = 5 * magnitude;
        else tickSpacing = 10 * magnitude;
        
        const adjustedRangeStart = Math.floor(rangeStart / tickSpacing) * tickSpacing;
        const adjustedRangeEnd = Math.ceil(rangeEnd / tickSpacing) * tickSpacing;
        const dataPointSpacing = (adjustedRangeEnd - adjustedRangeStart) / (Math.max(histogramData.data.length - 1, 1));
        
        // Create vertical confidence bounds using scatter plot approach
        const createVerticalLineData = (xValue, yMax = 100) => {
            const points = [];
            for (let y = 0; y <= yMax; y += 2) { // Step by 2 for smoother line
                points.push({ x: xValue, y: y });
            }
            return points;
        };
        
        const meanLineData = createVerticalLineData(gaussianParams.mean);
        const stdDev1LowerData = createVerticalLineData(gaussianParams.mean - gaussianParams.stdDev);
        const stdDev1UpperData = createVerticalLineData(gaussianParams.mean + gaussianParams.stdDev);
        const stdDev2LowerData = createVerticalLineData(gaussianParams.mean - 2 * gaussianParams.stdDev);
        const stdDev2UpperData = createVerticalLineData(gaussianParams.mean + 2 * gaussianParams.stdDev);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Probability Density',
                        data: (histogramData.data || []).map((value, index) => ({
                            x: adjustedRangeStart + index * dataPointSpacing,
                            y: value
                        })),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                        hitRadius: 10,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Cumulative Probability',
                        data: (histogramData.cumulativeData || []).map((value, index) => ({
                            x: adjustedRangeStart + index * dataPointSpacing,
                            y: value
                        })),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        hitRadius: 18,
                        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
                        pointHoverBorderColor: 'rgba(255, 255, 255, 1)',
                        pointHoverBorderWidth: 5,
                        tension: 0.4,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Mean',
                        data: meanLineData,
                        type: 'scatter',
                        borderColor: 'rgba(0, 255, 0, 0.8)',
                        backgroundColor: 'rgba(0, 255, 0, 0.8)',
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '68.2% (1σ)',
                        data: stdDev1LowerData,
                        type: 'scatter',
                        borderColor: 'rgba(0, 255, 0, 0.6)',
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '68.2% (1σ)',
                        data: stdDev1UpperData,
                        type: 'scatter',
                        borderColor: 'rgba(0, 255, 0, 0.6)',
                        backgroundColor: 'rgba(0, 255, 0, 0.6)',
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '98.7% (2σ)',
                        data: stdDev2LowerData,
                        type: 'scatter',
                        borderColor: 'rgba(0, 255, 0, 0.4)',
                        backgroundColor: 'rgba(0, 255, 0, 0.4)',
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '98.7% (2σ)',
                        data: stdDev2UpperData,
                        type: 'scatter',
                        borderColor: 'rgba(0, 255, 0, 0.4)',
                        backgroundColor: 'rgba(0, 255, 0, 0.4)',
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true,
                        fill: false,
                        tension: 0,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Damage Distribution (Gaussian Approximation)',
                        color: '#fff',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const dataIndex = context[0].dataIndex;
                                const xValue = adjustedRangeStart + dataIndex * dataPointSpacing;
                                const formatNumber = (num) => {
                                    if (num >= 1000000) {
                                        return (num / 1000000).toFixed(1) + 'M';
                                    } else if (num >= 100000) {
                                        return (num / 1000).toFixed(0) + 'K';
                                    } else {
                                        return num.toLocaleString();
                                    }
                                };
                                return `Damage: ${formatNumber(xValue)}`;
                            },
                            label: function(context) {
                                const formatNumber = (num) => {
                                    if (num >= 1000000) {
                                        return (num / 1000000).toFixed(1) + 'M';
                                    } else if (num >= 100000) {
                                        return (num / 1000).toFixed(0) + 'K';
                                    } else {
                                        return num.toLocaleString();
                                    }
                                };
                                
                                if (context.dataset.type === 'scatter') {
                                    // For scatter plots (vertical lines), use the x value directly
                                    return `${context.dataset.label}: ${formatNumber(context.parsed.x)}`;
                                } else {
                                    // For line charts, use the parsed x value directly
                                    if (context.dataset.label === 'Probability Density') {
                                        return `Probability Density: ${context.parsed.y.toFixed(1)}%`;
                                    } else if (context.dataset.label === 'Cumulative Probability') {
                                        return `P(Damage ≥ ${formatNumber(context.parsed.x)}): ${context.parsed.y.toFixed(1)}%`;
                                    }
                                    return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Damage',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff',
                            stepSize: tickSpacing,
                            callback: function(value) {
                                if (value >= 1000000) {
                                    const m = value / 1000000;
                                    return m === Math.floor(m) ? m.toFixed(0) + 'M' : m.toFixed(2) + 'M';
                                }
                                if (value >= 1000) {
                                    const k = value / 1000;
                                    return k === Math.floor(k) ? k.toFixed(0) + 'K' : k.toFixed(2) + 'K';
                                }
                                return value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Probability Density',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(0) + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Cumulative Probability',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(0) + '%';
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Build cumulative mean/variance time series from per-hit distribution stats.
     * Returns one data point per tick where damage lands.
     */
    function buildTimeSeries(stats) {
        if (!stats || stats.length === 0) return [];

        // Group hits by tick
        const tickMap = new Map();
        stats.forEach(stat => {
            if (!tickMap.has(stat.tick)) tickMap.set(stat.tick, []);
            tickMap.get(stat.tick).push(stat);
        });

        // Sort ticks and compute cumulative stats
        const ticks = [...tickMap.keys()].sort((a, b) => a - b);
        let cumMean = 0;
        let cumVariance = 0;
        const series = [];

        for (const tick of ticks) {
            for (const stat of tickMap.get(tick)) {
                if (stat.distributionType === 'combined') {
                    const p1 = stat.critProbability;
                    const mu1 = stat.critMean;
                    const s1sq = stat.critVariance;
                    const p2 = stat.nonCritProbability;
                    const mu2 = stat.nonCritMean;
                    const s2sq = stat.nonCritVariance;
                    const mixMean = p1 * mu1 + p2 * mu2;
                    const mixVar = p1 * s1sq + p2 * s2sq + p1 * p2 * Math.pow(mu1 - mu2, 2);
                    cumMean += mixMean * stat.likelihood;
                    cumVariance += mixVar * stat.likelihood;
                } else {
                    const mean = (stat.minDamage + stat.maxDamage) / 2;
                    const variance = Math.pow((stat.maxDamage - stat.minDamage) / 2, 2) / 3;
                    cumMean += mean * stat.likelihood;
                    cumVariance += variance * stat.likelihood;
                }
            }
            // Add other damage sources' mean and variance at this tick
            const extraMean =
                (poisonPerTick[tick] || 0) +
                (familiarPerTick[tick] || 0) +
                (dreadnipPerTick[tick] || 0) +
                (conjurePerTick[tick] || 0);
            const extraVariance =
                (familiarVariancePerTick[tick] || 0) +
                (dreadnipVariancePerTick[tick] || 0) +
                (conjureVariancePerTick[tick] || 0);
            // Note: poison variance not yet tracked

            const totalMean = cumMean + extraMean;
            const totalVariance = cumVariance + extraVariance;
            const stdDev = Math.sqrt(totalVariance);
            series.push({
                tick,
                mean: cumMean,
                totalMean,
                sigma2Upper: totalMean + 2 * stdDev,    // 95% CI
                sigma2Lower: Math.max(0, totalMean - 2 * stdDev),
                sigma3Upper: totalMean + 3 * stdDev,    // 99.7% CI
                sigma3Lower: Math.max(0, totalMean - 3 * stdDev)
            });
        }
        return series;
    }

    function updateTimeSeriesChart() {
        if (!timeSeriesCanvas) return;
        if (timeSeriesChart) timeSeriesChart.destroy();

        const series = buildTimeSeries(distributionStats);
        if (series.length === 0) return;

        const ctx = timeSeriesCanvas.getContext('2d');
        const labels = series.map(s => s.tick);



        // Build cumulative data aligned to the ticks in the series
        const hasPoisonData = poisonDamage > 0 && poisonPerTick.length > 0;
        const poisonData = hasPoisonData
            ? series.map(s => (s.tick < poisonPerTick.length ? poisonPerTick[s.tick] : poisonPerTick[poisonPerTick.length - 1]) || 0)
            : [];

        const hasFamiliarData = familiarDamage > 0 && familiarPerTick.length > 0;
        const familiarData = hasFamiliarData
            ? series.map(s => (s.tick < familiarPerTick.length ? familiarPerTick[s.tick] : familiarPerTick[familiarPerTick.length - 1]) || 0)
            : [];

        const hasDreadnipData = dreadnipDamage > 0 && dreadnipPerTick.length > 0;
        const dreadnipData = hasDreadnipData
            ? series.map(s => (s.tick < dreadnipPerTick.length ? dreadnipPerTick[s.tick] : dreadnipPerTick[dreadnipPerTick.length - 1]) || 0)
            : [];

        const hasConjureData = conjureDamage > 0 && conjurePerTick.length > 0;
        const conjureData = hasConjureData
            ? series.map(s => (s.tick < conjurePerTick.length ? conjurePerTick[s.tick] : conjurePerTick[conjurePerTick.length - 1]) || 0)
            : [];

        // Helper to build {x, y} points for linear x-axis
        const toPoints = (yFn) => series.map(s => ({ x: s.tick, y: yFn(s) }));

        const datasets = [
            // 3σ upper bound (fill down to 3σ lower) — 99.7% CI
            {
                label: '99.7% CI',
                data: toPoints(s => s.sigma3Upper),
                borderColor: 'transparent',
                backgroundColor: 'rgba(120, 190, 255, 0.10)',
                fill: '+4', // fill to 3σ lower dataset
                pointRadius: 0,
                tension: 0.3
            },
            // 2σ upper bound (fill down to 2σ lower) — 95% CI
            {
                label: '95% CI',
                data: toPoints(s => s.sigma2Upper),
                borderColor: 'transparent',
                backgroundColor: 'rgba(120, 190, 255, 0.18)',
                fill: '+2', // fill to 2σ lower dataset
                pointRadius: 0,
                tension: 0.3
            },
            // Mean line (ability damage only)
            {
                label: 'Ability Damage',
                data: toPoints(s => s.mean),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            },
            // 2σ lower bound
            {
                label: '95% CI Lower',
                data: toPoints(s => s.sigma2Lower),
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                fill: false,
                pointRadius: 0,
                tension: 0.3
            },
            // 3σ lower bound
            {
                label: '99.7% CI Lower',
                data: toPoints(s => s.sigma3Lower),
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                fill: false,
                pointRadius: 0,
                tension: 0.3
            }
        ];

        // Add poison line if there is poison damage
        if (hasPoisonData) {
            datasets.push({
                label: 'Poison Damage',
                data: series.map((s, i) => ({ x: s.tick, y: poisonData[i] || 0 })),
                borderColor: '#4CAF50',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            });
        }

        // Add familiar line if there is familiar damage
        if (hasFamiliarData) {
            datasets.push({
                label: 'Familiar Damage',
                data: series.map((s, i) => ({ x: s.tick, y: familiarData[i] || 0 })),
                borderColor: '#00eeee',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            });
        }

        // Add dreadnip line if there is dreadnip damage
        if (hasDreadnipData) {
            datasets.push({
                label: 'Dreadnip Damage',
                data: series.map((s, i) => ({ x: s.tick, y: dreadnipData[i] || 0 })),
                borderColor: '#ff8c00',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            });
        }

        // Add conjure line if there is conjure damage
        if (hasConjureData) {
            datasets.push({
                label: 'Conjure Damage',
                data: series.map((s, i) => ({ x: s.tick, y: conjureData[i] || 0 })),
                borderColor: '#d694ff',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            });
        }

        // Add total damage line if there are any extra damage sources
        const hasExtraSources = hasPoisonData || hasFamiliarData || hasDreadnipData || hasConjureData;
        if (hasExtraSources) {
            datasets.push({
                label: 'Total Damage',
                data: series.map((s, i) => {
                    let total = s.mean;
                    if (hasPoisonData) total += (poisonData[i] || 0);
                    if (hasFamiliarData) total += (familiarData[i] || 0);
                    if (hasDreadnipData) total += (dreadnipData[i] || 0);
                    if (hasConjureData) total += (conjureData[i] || 0);
                    return { x: s.tick, y: total };
                }),
                borderColor: '#ffd700',
                backgroundColor: 'transparent',
                borderWidth: 3,
                fill: false,
                pointRadius: 0,
                hitRadius: 10,
                tension: 0.3
            });
        }

        // Build legend filter list dynamically
        const visibleLabels = ['Ability Damage', '95% CI', '99.7% CI'];
        if (hasPoisonData) visibleLabels.push('Poison Damage');
        if (hasFamiliarData) visibleLabels.push('Familiar Damage');
        if (hasDreadnipData) visibleLabels.push('Dreadnip Damage');
        if (hasConjureData) visibleLabels.push('Conjure Damage');
        if (hasExtraSources) visibleLabels.push('Total Damage');

        // Calculate DPM — only use patternStartTick when a boss preset is selected
        const startTick = patternStartTick > 0 ? patternStartTick : 0;
        const lastTick = series[series.length - 1]?.tick || 1;
        // Subtract pause ticks (boss invulnerable) that fall within the measured range
        const pauseTicks = (phaseTransitions || [])
            .filter(pt => pt.tick >= startTick && pt.tick <= lastTick)
            .reduce((sum, pt) => sum + (pt.pause || 0), 0);
        const dpmTicks = lastTick - startTick - pauseTicks;

        // Find cumulative damage at start tick to subtract pre-build damage
        const startIdx = series.findIndex(s => s.tick >= startTick);
        const startMean = startIdx > 0 ? series[startIdx - 1].mean : 0;
        const startPoison = startIdx > 0 && hasPoisonData ? (poisonData[startIdx - 1] || 0) : 0;
        const startFamiliar = startIdx > 0 && hasFamiliarData ? (familiarData[startIdx - 1] || 0) : 0;
        const startDreadnip = startIdx > 0 && hasDreadnipData ? (dreadnipData[startIdx - 1] || 0) : 0;
        const startConjure = startIdx > 0 && hasConjureData ? (conjureData[startIdx - 1] || 0) : 0;

        const endMean = series[series.length - 1]?.mean || 0;
        const endPoison = hasPoisonData ? (poisonData[poisonData.length - 1] || 0) : 0;
        const endFamiliar = hasFamiliarData ? (familiarData[familiarData.length - 1] || 0) : 0;
        const endDreadnip = hasDreadnipData ? (dreadnipData[dreadnipData.length - 1] || 0) : 0;
        const endConjure = hasConjureData ? (conjureData[conjureData.length - 1] || 0) : 0;

        const totalAllDamage = (endMean - startMean) + (endPoison - startPoison) + (endFamiliar - startFamiliar) + (endDreadnip - startDreadnip) + (endConjure - startConjure);
        const rotationSeconds = dpmTicks * 0.6;
        const dpm = rotationSeconds > 0 ? Math.round(totalAllDamage / rotationSeconds * 60) : 0;

        // Plugin: draw phase transition lines and DPM annotation
        const phaseAndDpmPlugin = {
            id: 'phaseAndDpm',
            afterDraw(chart) {
                const { ctx, chartArea, scales } = chart;
                if (!chartArea) return;

                // Draw pattern start tick line when set above 0
                if (patternStartTick > 0) {
                    const x = scales.x.getPixelForValue(patternStartTick);
                    if (x >= chartArea.left && x <= chartArea.right) {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([4, 3]);
                        ctx.beginPath();
                        ctx.moveTo(x, chartArea.top);
                        ctx.lineTo(x, chartArea.bottom);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('Start', x, chartArea.top - 4);
                        ctx.restore();
                    }
                }

                // Draw phase transition vertical lines
                if (phaseTransitions?.length > 0) {
                    for (const pt of phaseTransitions) {
                        const x = scales.x.getPixelForValue(pt.tick);
                        if (x < chartArea.left || x > chartArea.right) continue;

                        ctx.save();
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                        ctx.lineWidth = 1.5;
                        ctx.setLineDash([6, 4]);
                        ctx.beginPath();
                        ctx.moveTo(x, chartArea.top);
                        ctx.lineTo(x, chartArea.bottom);
                        ctx.stroke();
                        ctx.setLineDash([]);

                        // Label
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                        ctx.font = 'bold 11px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(pt.label, x, chartArea.top - 4);
                        ctx.restore();
                    }
                }

                // Draw DPM annotation (top-left)
                if (dpm > 0) {
                    ctx.save();
                    ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'left';
                    ctx.fillText(`${formatDmg(dpm)} DPM`, chartArea.left + 8, chartArea.top + 20);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.font = '12px sans-serif';
                    ctx.fillText(`${rotationSeconds.toFixed(1)}s rotation`, chartArea.left + 8, chartArea.top + 36);
                    ctx.restore();
                }
            }
        };

        timeSeriesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets
            },
            plugins: [phaseAndDpmPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Cumulative Damage Over Time',
                        color: '#fff',
                        font: { size: 14 }
                    },
                    legend: {
                        labels: {
                            color: '#fff',
                            filter: (item) => visibleLabels.includes(item.text),
                            padding: 16
                        },
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            title: (ctx) => `Tick ${ctx[0].parsed.x}`,
                            label: (ctx) => {
                                if (ctx.dataset.label === 'Ability Damage') {
                                    return `Ability: ${formatDmg(ctx.parsed.y)}`;
                                }
                                if (ctx.dataset.label === 'Total Damage') {
                                    return `Total: ${formatDmg(ctx.parsed.y)}`;
                                }
                                if (ctx.dataset.label === 'Poison Damage') {
                                    return `Poison: ${formatDmg(ctx.parsed.y)}`;
                                }
                                if (ctx.dataset.label === 'Familiar Damage') {
                                    return `Familiar: ${formatDmg(ctx.parsed.y)}`;
                                }
                                if (ctx.dataset.label === 'Dreadnip Damage') {
                                    return `Dreadnip: ${formatDmg(ctx.parsed.y)}`;
                                }
                                if (ctx.dataset.label === 'Conjure Damage') {
                                    return `Conjure: ${formatDmg(ctx.parsed.y)}`;
                                }
                                // For CI bounds, show the range
                                const tick = ctx.dataIndex;
                                const s = series[tick];
                                if (ctx.dataset.label === '95% CI') {
                                    return `95% CI: ${formatDmg(s.sigma2Lower)} – ${formatDmg(s.sigma2Upper)}`;
                                }
                                if (ctx.dataset.label === '99.7% CI') {
                                    return `99.7% CI: ${formatDmg(s.sigma3Lower)} – ${formatDmg(s.sigma3Upper)}`;
                                }
                                return null;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Tick', color: '#fff' },
                        ticks: {
                            color: '#fff',
                            stepSize: labels.length > 50 ? 25 : labels.length > 25 ? 10 : 5,
                            callback: (value) => Number.isInteger(value) ? value : null
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        title: { display: true, text: 'Cumulative Damage', color: '#fff' },
                        ticks: {
                            color: '#fff',
                            callback: (value) => formatDmg(value)
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                }
            }
        });
    }

    // Update charts when props change
    $: if (distributionStats && chartCanvas) {
        logger.log(LogCategory.ROTATION, 'DamageDistributionChart received distributionStats', distributionStats);
        updateChart();
    }
    $: if (distributionStats && timeSeriesCanvas) {
        // Depend on all per-tick arrays and phase transitions to re-render when they change
        poisonPerTick;
        familiarPerTick;
        dreadnipPerTick;
        conjurePerTick;
        phaseTransitions;
        updateTimeSeriesChart();
    }
    $: if (distributionStats && breakdownCanvas) {
        poisonDamage;
        familiarDamage;
        dreadnipDamage;
        conjureDamage;
        updateBreakdownChart();
    }

    onMount(() => {
        updateChart();
        updateTimeSeriesChart();
        updateBreakdownChart();
    });

    onDestroy(() => {
        if (chart) chart.destroy();
        if (timeSeriesChart) timeSeriesChart.destroy();
        if (breakdownChart) breakdownChart.destroy();
    });
</script>

<div class="damage-chart-container">
    {#if expandedChart === null}
        <!-- Thumbnail overview row -->
        <div class="thumbnail-row">
            <button class="thumbnail-card" on:click={() => toggleChart('timeline')}>
                <svg class="thumbnail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="4,18 8,12 12,14 16,8 20,10"></polyline>
                    <line x1="4" y1="20" x2="20" y2="20"></line>
                    <line x1="4" y1="4" x2="4" y2="20"></line>
                </svg>
                <span class="thumbnail-title">Cumulative Damage</span>
                <span class="thumbnail-stat">{thumbnailDpm > 0 ? `${formatDmg(thumbnailDpm)} DPM` : '0'}</span>
            </button>
            <button class="thumbnail-card" on:click={() => toggleChart('breakdown')}>
                <svg class="thumbnail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="4" y="4" width="12" height="3" rx="1"></rect>
                    <rect x="4" y="10" width="9" height="3" rx="1"></rect>
                    <rect x="4" y="16" width="6" height="3" rx="1"></rect>
                </svg>
                <span class="thumbnail-title">Damage Breakdown</span>
                <span class="thumbnail-stat">{distributionStats.length > 0 ? `${new Set(distributionStats.map(s => getParentKey(s.ability))).size} sources` : '0 sources'}</span>
            </button>
            <button class="thumbnail-card" on:click={() => toggleChart('distribution')}>
                <svg class="thumbnail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4,20 Q8,20 10,16 Q12,4 14,16 Q16,20 20,20"></path>
                    <line x1="4" y1="20" x2="20" y2="20"></line>
                </svg>
                <span class="thumbnail-title">Distribution</span>
                <span class="thumbnail-stat">{gaussianParams.stdDev > 0 ? `${formatDmg(Math.round(gaussianParams.mean))} avg` : '0 avg'}</span>
            </button>
        </div>
    {:else}
        <!-- Expanded chart view -->
        <button class="back-btn" on:click={() => toggleChart(expandedChart)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            Back to overview
        </button>

        {#if expandedChart === 'timeline'}
            <div class="chart-wrapper">
                <canvas bind:this={timeSeriesCanvas}></canvas>
            </div>
        {:else if expandedChart === 'breakdown'}
            <div class="chart-wrapper" style="height: {Math.max(200, buildBreakdownData().length * 28 + 60)}px">
                <canvas bind:this={breakdownCanvas}></canvas>
            </div>
        {:else if expandedChart === 'distribution'}
            <div class="chart-wrapper">
                <canvas bind:this={chartCanvas}></canvas>
            </div>
            {#if gaussianParams.stdDev > 0}
                <div class="distribution-info">
                    <div class="confidence-grid">
                        <div class="confidence-item">
                            <span class="confidence-label">Mean:</span>
                            <span class="confidence-value">{Math.round(gaussianParams.mean).toLocaleString()}</span>
                        </div>
                        <div class="confidence-item">
                            <span class="confidence-label">Std Dev:</span>
                            <span class="confidence-value">{Math.round(gaussianParams.stdDev).toLocaleString()}</span>
                        </div>
                        <div class="confidence-item">
                            <span class="confidence-label">95% CI:</span>
                            <span class="confidence-value">{confidence95.lower.toLocaleString()} - {confidence95.upper.toLocaleString()}</span>
                        </div>
                        <div class="confidence-item">
                            <span class="confidence-label">99.7% CI:</span>
                            <span class="confidence-value">{confidence997.lower.toLocaleString()} - {confidence997.upper.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    {/if}
</div>

<style>
    .damage-chart-container {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid #444;
        border-radius: 6px;
        overflow: hidden;
        margin: 0.5rem 0;
    }

    /* Thumbnail row */
    .thumbnail-row {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 0.5rem;
        padding: 0.5rem;
    }

    .thumbnail-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #555;
        border-radius: 6px;
        padding: 0.75rem 0.5rem;
        cursor: pointer;
        color: #fff;
        transition: border-color 0.15s, background 0.15s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
    }

    .thumbnail-card:hover {
        border-color: #888;
        background: rgba(255, 255, 255, 0.06);
    }

    .thumbnail-icon {
        width: 28px;
        height: 28px;
        color: #888;
    }

    .thumbnail-card:hover .thumbnail-icon {
        color: #bbb;
    }

    .thumbnail-title {
        font-size: 0.8rem;
        font-weight: 500;
        color: #ccc;
    }

    .thumbnail-stat {
        font-size: 0.75rem;
        color: #4ade80;
        font-weight: 600;
    }

    /* Back button */
    .back-btn {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem 0.0rem 0.75rem;
        background: none;
        border: none;
        color: #aaa;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .back-btn:hover {
        color: #fff;
    }

    .chart-wrapper {
        position: relative;
        height: 500px;
        padding: 0 0.75rem;
        margin: 0 0 0.5rem;
    }

    .distribution-info {
        padding: 0.5rem 0.75rem;
        border-top: 1px solid #444;
    }

    .confidence-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
    }

    .confidence-item {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
    }

    .confidence-label {
        color: #ccc;
        font-size: 0.85rem;
    }

    .confidence-value {
        color: #4ade80;
        font-weight: bold;
        font-size: 0.85rem;
    }

    @media (max-width: 768px) {
        .thumbnail-row {
            grid-template-columns: 1fr 1fr 1fr;
        }

        .chart-wrapper {
            height: 300px;
        }

        .thumbnail-card {
            padding: 0.5rem 0.25rem;
        }

        .thumbnail-title {
            font-size: 0.7rem;
        }
    }
</style> 