import React from 'react';

export default function SkeletonDashboard() {
  return (
    <div className="skeleton-container w-100" style={{ paddingBottom: '80px' }}>
      <div className="skeleton-pulse skeleton-box" style={{ height: '210px', borderRadius: '1rem', marginTop: '0.5rem' }}></div>
      <div className="skeleton-pulse skeleton-box" style={{ height: '24px', borderRadius: '4px', marginTop: '0.5rem', marginBottom: '1rem' }}></div>
      <div className="skeleton-pulse skeleton-box" style={{ height: '180px', borderRadius: '1rem' }}></div>
      <div className="mt-4">
        <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
        <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
        <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
        <div className="skeleton-pulse skeleton-box" style={{ height: '65px', borderRadius: '12px' }}></div>
      </div>
    </div>
  );
}