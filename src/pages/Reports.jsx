import React, {
  useState,
} from 'react';

import { api } from '../api';

const money = (n) =>
  `₹${Number(n || 0).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    }
  )}`;

export default function Reports() {

  const [mode, setMode] =
    useState('daily');

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [month, setMonth] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 7)
    );

  const [report, setReport] =
    useState(null);

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const run = async () => {

    setLoading(true);
    setError('');

    try {

      const result =
        mode === 'daily'
          ? await api.reports.daily(date)
          : await api.reports.monthly(month);

      setReport(result);

    } catch (e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div>

      <div className="section-head">

        <div>

          <h2>
            Reports & financial analysis
          </h2>

          <p className="muted">
            Generate daily or monthly summaries
            for the poultry business.
          </p>

        </div>

      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="panel report-controls">

        <div className="segmented">

          <button
            className={
              mode === 'daily'
                ? 'selected'
                : ''
            }
            onClick={() =>
              setMode('daily')
            }
          >
            Daily
          </button>

          <button
            className={
              mode === 'monthly'
                ? 'selected'
                : ''
            }
            onClick={() =>
              setMode('monthly')
            }
          >
            Monthly
          </button>

        </div>

        {mode === 'daily' ? (

          <input
            className="input compact"
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

        ) : (

          <input
            className="input compact"
            type="month"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          />

        )}

        <button
          className="primary-btn"
          onClick={run}
          disabled={loading}
        >
          {loading
            ? 'Generating...'
            : 'Generate report'}
        </button>

      </div>

      {report && (
        <ReportCard
          report={report}
        />
      )}

    </div>
  );
}

function ReportCard({
  report,
}) {

  return (
    <div className="panel report-card">

      <div className="report-title">

        <div>

          <div className="eyebrow">
            FINANCIAL REPORT
          </div>

          <h3>
            {report.period ||
              report.date ||
              report.month ||
              'Selected period'}
          </h3>

        </div>

      </div>

      <div className="stats-grid compact-grid">

        <Mini
          label="Eggs sold"
          value={Number(
            report.eggsSold || 0
          ).toLocaleString('en-IN')}
        />

        <Mini
          label="Sales"
          value={money(report.sales)}
        />

        <Mini
          label="Other income"
          value={money(
            report.otherIncome
          )}
        />

        <Mini
          label="Expenses"
          value={money(
            report.expenses
          )}
        />

        <Mini
          label="Tax"
          value={money(report.tax)}
        />

        <Mini
          label="Net profit / loss"
          value={money(report.profit)}
        />

      </div>

      <pre className="json-preview">
        {JSON.stringify(
          report,
          null,
          2
        )}
      </pre>

    </div>
  );
}

function Mini({
  label,
  value,
}) {

  return (
    <div className="stat-card subtle">

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

    </div>
  );
}