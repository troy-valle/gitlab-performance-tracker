'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';


interface DateRangePickerProps {
    initStartDate: string;
    initEndDate: string;
}

export default function DateRangePicker({initStartDate, initEndDate}: DateRangePickerProps) {

  const [startDate, setStartDate] = useState<string>(initStartDate);
  const [endDate, setEndDate] = useState<string>(initEndDate);
  const [applyUrl, setApplyUrl] = useState<string>('');

  const formChanged = () => {
    const url = new URL(window.location.href);

    url.searchParams.set('startDate', startDate);

    url.searchParams.set('endDate', endDate);

    setApplyUrl(url.toString()); 
  };

  useEffect(() => {
    formChanged();
  })

  return (
      <div>
        <div>
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); formChanged() }}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); formChanged(); }}
            />
          </div>
        </div>
        <Link
          href={applyUrl}
        >
          Apply Filter
        </Link>
      </div>
  );
}