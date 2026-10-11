
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { NavLink } from 'react-router-dom';
import { api } from '../api';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};

export default function Dashboard() {
  const [data, setData] = useState({});
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState({});
  const [stockLoaded, setStockLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        api.dashboard(),
        api.sales.list(),
        api.stock.summary(),
      ]);

      if (results[0].status === 'fulfilled') {
        const result = results[0].value;
        setData(result?.data ?? result ?? {});
      } else {
        throw results[0].reason;
      }

      if (results[1].status === 'fulfilled') {
        const result = results[1].value;
        const records = result?.data ?? result;
        setSales(Array.isArray(records) ? records : []);
      } else {
        setSales([]);
      }

      if (results[2].status === 'fulfilled') {
        const result = results[2].value;
        setStock(result?.data ?? result ?? {});
        setStockLoaded(true);
      } else {
        setStock({});
        setStockLoaded(false);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      days.push({
        key,
        label: date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
        sold: 0,
      });
    }

    const dayMap = new Map(days.map((day) => [day.key, day]));

    sales.forEach((sale) => {
      const saleDate = String(
        sale.saleDate || sale.date || ''
      ).slice(0, 10);

      const day = dayMap.get(saleDate);

      if (day) {
        day.sold += Number(sale.eggsSold) || 0;
      }
    });

    return {
      labels: days.map((day) => day.label),
      datasets: [
        {
          label: 'Eggs Sold',
          data: days.map((day) => day.sold),
          borderColor: '#168de2',
          backgroundColor: 'rgba(22, 141, 226, 0.15)',
          pointBackgroundColor: '#168de2',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [sales]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#edf1f3',
        },
        ticks: {
          callback: (value) => formatNumber(value),
        },
      },
    },
  };

  const eggCards = [
    {
      title: 'Total Collected',
      value: stockLoaded ? formatNumber(stock.totalCollected) : '—',
      icon: '🧺',
      color: 'mint',
      description: 'Recorded egg collection',
    },
    {
      title: 'Damaged Eggs',
      value: stockLoaded ? formatNumber(stock.damagedEggs) : '—',
      icon: '🥚',
      color: 'peach',
      description: 'Recorded damaged eggs',
    },
    {
      title: 'Eggs Sold',
      value: formatNumber(data.eggsSold),
      icon: '🔵',
      color: 'sky',
      description: 'Recorded sales',
    },
    {
      title: 'Available Stock',
      value: stockLoaded ? formatNumber(stock.availableStock) : '—',
      icon: '📦',
      color: 'lavender',
      description: 'Current available eggs',
    },
  ];

  const financialCards = [
    {
      title: 'Total Income',
      value: money(data.totalIncome),
      icon: '₹',
      color: 'mint',
    },
    {
      title: 'Total Expenses',
      value: money(data.expenses),
      icon: '↘',
      color: 'peach',
    },
    {
      title: 'Tax',
      value: money(data.tax),
      icon: '%',
      color: 'lavender',
    },
    {
      title: 'Net Profit',
      value: money(data.profit),
      icon: '▥',
      color: 'sky',
    },
  ];

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort(
          (a, b) =>
            new Date(b.saleDate || b.date || 0).getTime() -
            new Date(a.saleDate || a.date || 0).getTime()
        )
        .slice(0, 4),
    [sales]
  );

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Morning'
      : currentHour < 17
        ? 'Afternoon'
        : 'Evening';

  return (
    <div className="poultry-dashboard">
      <div className="farm-content">
        <section className="farm-welcome">
          <div className="welcome-copy">
            <div className="welcome-title">
              <span className="welcome-leaf">🌿</span>
              <h1>Good {greeting}, Farm Admin!</h1>
            </div>

            <p>
              Here's what's happening with your poultry farm today.
            </p>

            <span className="welcome-date">
              ▦ &nbsp;
              {new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="welcome-hen" aria-hidden="true">
            🐓
          </div>
        </section>

        {error && (
          <div className="dashboard-alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadData}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="dashboard-loading">
            Loading your farm data...
          </div>
        ) : (
          <>
            <section className="egg-stats-grid">
              {eggCards.map((card) => (
                <article
                  className={`egg-stat-card ${card.color}`}
                  key={card.title}
                >
                  <div className="egg-stat-icon" aria-hidden="true">
                    {card.icon}
                  </div>

                  <div className="egg-stat-info">
                    <p>{card.title}</p>
                    <h2>{card.value}</h2>
                    <span>{card.description}</span>
                  </div>

                  <div className="stat-decoration" />
                </article>
              ))}
            </section>

            <section className="dashboard-middle-grid">
              <article className="farm-panel production-panel">
                <div className="farm-panel-heading">
                  <div className="heading-icon">▥</div>

                  <div>
                    <h2>Egg Production &amp; Sales Overview</h2>
                    <p>Recorded egg sales over the last 7 days</p>
                  </div>

                  <button
                    type="button"
                    className="dashboard-reload"
                    onClick={loadData}
                    title="Refresh dashboard"
                    aria-label="Refresh dashboard"
                  >
                    ↻
                  </button>
                </div>

                <div className="farm-chart">
                  <Line data={chartData} options={chartOptions} />
                </div>

                <p className="chart-caption">
                  Chart values are calculated from recorded sales.
                </p>
              </article>

              <article className="farm-panel recent-panel">
                <div className="farm-panel-heading">
                  <div className="heading-icon">◷</div>

                  <div>
                    <h2>Recent Activity</h2>
                    <p>Latest recorded sales</p>
                  </div>
                </div>

                {recentSales.length === 0 ? (
                  <p className="empty-activity">
                    No sales records available yet.
                  </p>
                ) : (
                  <div className="activity-list">
                    {recentSales.map((sale, index) => (
                      <div
                        className="activity-item"
                        key={sale.id ?? `${sale.saleDate}-${index}`}
                      >
                        <div
                          className={`activity-icon activity-${index % 4}`}
                          aria-hidden="true"
                        >
                          {index === 0 ? '🛒' : '🥚'}
                        </div>

                        <div className="activity-description">
                          <strong>Sale recorded</strong>
                          <span>
                            {formatNumber(sale.eggsSold)} eggs sold
                          </span>
                        </div>

                        <time>
                          {formatDate(sale.saleDate || sale.date)}
                        </time>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>

            <section className="dashboard-bottom-grid">
              <article className="farm-panel financial-panel">
                <div className="farm-panel-heading">
                  <div className="heading-icon rupee-icon">₹</div>

                  <div>
                    <h2>Financial Summary</h2>
                    <p>Overview of your farm finances</p>
                  </div>
                </div>

                <div className="financial-cards">
                  {financialCards.map((card) => (
                    <div
                      className={`financial-card ${card.color}`}
                      key={card.title}
                    >
                      <div className="financial-icon">
                        {card.icon}
                      </div>

                      <span>{card.title}</span>
                      <strong>{card.value}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="farm-promo">
                <div className="promo-copy">
                  <span>🌿</span>
                  <h2>
                    Healthy Birds,
                    <br />
                    Happy Business
                  </h2>

                  <p>
                    Better management today
                    <br />
                    for a brighter tomorrow.
                  </p>

                  <NavLink to="/stock" className="promo-button">
                    Manage Farm <span>→</span>
                  </NavLink>
                </div>

                <div className="promo-hen" aria-hidden="true">
                  🐓
                </div>

                <div className="promo-eggs" aria-hidden="true">
                  🥚 🥚 🥚
                </div>
              </article>
            </section>
          </>
        )}

        <footer className="farm-footer">
          Smart Poultry Farm Management and Financial Analytics System
        </footer>
      </div>
    </div>
  );
}
