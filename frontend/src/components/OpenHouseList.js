import React from 'react';
import './OpenHouseList.css';

export default function OpenHouseList({ openHouses }) {
  if (!openHouses || openHouses.length === 0) {
    return (
      <div className="openhouses-container">
        <h3>Upcoming Open Houses</h3>
        <p className="no-openhouses">No open houses scheduled for this property.</p>
      </div>
    );
  }

  // Helper to extract remarks from the all_data JSON string
  const extractRemarks = (ohRecord) => {
    if (!ohRecord.all_data) return null;
    try {
      const parsed = typeof ohRecord.all_data === 'string' 
        ? JSON.parse(ohRecord.all_data) 
        : ohRecord.all_data;
      return parsed.OpenHouseRemarks || parsed.rd_remarks || null;
    } catch (err) {
      return null;
    }
  };

  return (
    <div className="openhouses-container">
      <h3>Upcoming Open Houses</h3>
      <div className="openhouses-grid">
        {openHouses.map((oh, index) => {
          const remarks = extractRemarks(oh);
          const dateStr = oh.rd_date || oh.OpenHouseDate || 'TBD';
          const startTime = oh.rd_start || oh.OpenHouseStartTime || '';
          const endTime = oh.rd_end || oh.OpenHouseEndTime || '';

          return (
            <div key={index} className="openhouse-card">
              <div className="oh-header">
                <span className="oh-date">📅 {dateStr}</span>
                {(startTime || endTime) && (
                  <span className="oh-time">⏰ {startTime} - {endTime}</span>
                )}
              </div>
              {remarks && <p className="oh-remarks">{remarks}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

