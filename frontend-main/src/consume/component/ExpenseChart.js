// 파일: src/consume/component/ExpenseChart.js
// 노인분들을 위한 큰 그래프 컴포넌트 (ApexCharts 사용)

import React from 'react';
import Chart from 'react-apexcharts';
import './ExpenseChart.css';

const ExpenseChart = ({ data, period }) => {
  if (!data || (!data.timeline && !data.categories)) {
    return (
      <div className="chart-container">
        <div className="chart-loading">
          📊 차트 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  // 타임라인 데이터 포맷팅
  const formatTimelineData = (timeline) => {
    if (!timeline || timeline.length === 0) return { categories: [], series: [] };
    
    const categories = [];
    const amounts = [];
    
    timeline.forEach((item, index) => {
      let label = '';
      const date = new Date(item.period);
      
      switch (period) {
        case 'daily':
          label = `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case 'weekly':
          label = `${date.getMonth() + 1}월 ${Math.ceil(date.getDate() / 7)}주`;
          break;
        case 'monthly':
          label = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          label = `${index + 1}`;
      }
      
      categories.push(label);
      amounts.push(item.totalAmount || 0);
    });
    
    return { categories, series: [{ name: '소비금액', data: amounts }] };
  };

  // 카테고리 데이터 포맷팅
  const formatCategoryData = (categories) => {
    if (!categories || categories.length === 0) return { labels: [], series: [] };
    
    const labels = categories.map(item => item.category);
    const amounts = categories.map(item => item.totalAmount || 0);
    
    return { labels, series: amounts };
  };

  // 금액 포맷팅 함수
  const formatAmount = (amount) => {
    // 숫자로 변환하고 소수점 제거
    const numAmount = Math.floor(parseFloat(amount) || 0);
    
    if (numAmount >= 10000) {
      return `${Math.floor(numAmount / 10000)}만원`;
    } else if (numAmount >= 1000) {
      return `${Math.floor(numAmount / 1000)}천원`;
    }
    return `${numAmount}원`;
  };

  const timelineData = formatTimelineData(data.timeline);
  const categoryData = formatCategoryData(data.categories);

  // 라인 차트 옵션 (소비 추이)
  const lineChartOptions = {
    chart: {
      type: 'line',
      height: 400,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 4
    },
    colors: ['#FF6B6B'],
    xaxis: {
      categories: timelineData.categories,
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: '#333'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => formatAmount(value),
        style: {
          fontSize: '14px',
          fontWeight: 600,
          colors: '#333'
        }
      }
    },
    tooltip: {
      y: {
        formatter: (value) => formatAmount(value)
      },
      style: {
        fontSize: '14px'
      }
    },
    grid: {
      borderColor: '#e0e0e0'
    },
    markers: {
      size: 8,
      colors: ['#FF6B6B'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  };

  // 도넛 차트 옵션 (카테고리별 소비 비율) - 파이차트에서 도넛차트로 개선
  const donutChartOptions = {
    chart: {
      type: 'donut',
      height: 450
    },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
    labels: categoryData.labels,
    tooltip: {
      y: {
        formatter: (value) => formatAmount(value)
      },
      style: {
        fontSize: '14px'
      }
    },
    legend: {
      fontSize: '16px',
      fontWeight: 600,
      position: 'bottom',
      offsetY: 10
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '18px',
              fontWeight: 600,
              color: '#333'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FF6B6B',
              formatter: (val) => formatAmount(val)
            },
            total: {
              show: true,
              showAlways: true,
              label: '총 소비',
              fontSize: '16px',
              fontWeight: 600,
              color: '#666',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatAmount(total);
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      },
      formatter: (val, opts) => {
        return val > 5 ? `${val.toFixed(0)}%` : '';
      },
      dropShadow: {
        enabled: false
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 350
        },
        legend: {
          fontSize: '14px'
        }
      }
    }]
  };

  return (
    <div className="chart-container">
      {/* 소비 추이 차트 */}
      {timelineData.series.length > 0 && timelineData.series[0].data.length > 0 && (
        <div className="chart-section">
          <h3 className="chart-section-title">
            📈 {period === 'daily' ? '일별' : period === 'weekly' ? '주별' : '월별'} 소비 추이
          </h3>
          <div className="chart-wrapper">
            <Chart
              options={lineChartOptions}
              series={timelineData.series}
              type="line"
              height={400}
            />
          </div>
        </div>
      )}

      {/* 카테고리별 도넛 차트 (소비 비율) */}
      {categoryData.series.length > 0 && (
        <div className="chart-section">
          <h3 className="chart-section-title">
            🍩 카테고리별 소비 비율
          </h3>
          <div className="chart-wrapper">
            <Chart
              options={donutChartOptions}
              series={categoryData.series}
              type="donut"
              height={450}
            />
          </div>
        </div>
      )}

      {/* 요약 정보 */}
      {data.summary && (
        <div className="chart-summary">
          <h3 className="chart-section-title">📋 요약 정보</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <div className="summary-label">총 소비금액</div>
                <div className="summary-value">{formatAmount(data.summary.totalAmount)}</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📝</div>
              <div className="summary-content">
                <div className="summary-label">총 소비횟수</div>
                <div className="summary-value">{data.summary.totalCount}회</div>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <div className="summary-label">평균 소비금액</div>
                <div className="summary-value">{formatAmount(data.summary.avgAmount)}</div>
              </div>
            </div>
            {data.summary.maxAmount > 0 && (
              <div className="summary-card">
                <div className="summary-icon">⬆️</div>
                <div className="summary-content">
                  <div className="summary-label">최대 소비금액</div>
                  <div className="summary-value">{formatAmount(data.summary.maxAmount)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;
