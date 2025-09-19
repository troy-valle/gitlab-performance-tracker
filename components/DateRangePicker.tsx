'use client';
import React, { useState, useEffect } from 'react';

// A custom hook to simulate Next.js useRouter functionality without Next.js dependencies.
// This allows the component to run and function correctly in this environment.
const useRouter = () => {
  const [query, setQuery] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      const newParams = new URLSearchParams(window.location.search);
      const newQuery: Record<string, string> = {};
      for (let [key, value] of newParams.entries()) {
        newQuery[key] = value;
      }
      setQuery(newQuery);
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Initial sync on load

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const push = ({ pathname, query: newQuery }: { pathname: string; query: Record<string, string> }) => {
    const params = new URLSearchParams(newQuery);
    const newUrl = `${pathname}?${params.toString()}`;
    window.history.pushState(null, '', newUrl);
    setQuery(newQuery); // Update state immediately to reflect the change
  };

  return { query, push };
};

/**
 * A Next.js React component for filtering data by a date range using URL query parameters.
 * It features two input fields for a start and end date and an "Apply" button.
 * The component is fully contained within this single file.
 */
export default function DateRangeFilter() {
  const router = useRouter();
  const { startDate: initialStartDate, endDate: initialEndDate } = router.query;

  const [startDate, setStartDate] = useState<string>(initialStartDate || '');
  const [endDate, setEndDate] = useState<string>(initialEndDate || '');

  useEffect(() => {
    setStartDate(router.query.startDate || '');
    setEndDate(router.query.endDate || '');
  }, [router.query.startDate, router.query.endDate]);

  const handleApply = () => {
    const { pathname } = window.location;
    const newQuery: Record<string, string> = { ...router.query };

    if (startDate) {
      newQuery.startDate = startDate;
    } else {
      delete newQuery.startDate;
    }

    if (endDate) {
      newQuery.endDate = endDate;
    } else {
      delete newQuery.endDate;
    }

    router.push({
      pathname,
      query: newQuery,
    });
  };

  return (
      <div>
        <div>
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleApply}
        >
          Apply Filter
        </button>
      </div>
  );
}