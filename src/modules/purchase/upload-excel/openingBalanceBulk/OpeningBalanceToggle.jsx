'use client'
import React, { useState } from 'react'
import OpeningBalanceBulkExcel from './OpeningBalanceBulkExcel'
import HistoryOpeningBalanceBulk from './HistoryOpeningBalanceBulk'

const OpeningBalanceToggle = () => {
  const [active, setActive] = useState('upload')

  return (
    <div className="max-w-7xl mx-auto  p-5 md:px-6 md:py-4">

      {/* Toggle — styled like image 2 */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActive('upload')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
              active === 'upload'
                ? 'bg-green-500 border-green-500 text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600'
            }`}
          >
            Upload Opening Balance Excel
          </button>
          <button
            type="button"
            onClick={() => setActive('history')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border-2 ${
              active === 'history'
                ? 'bg-green-500 border-green-500 text-white shadow-md'
                : 'bg-white border-gray-300 text-gray-500 hover:border-green-400 hover:text-green-600'
            }`}
          >
            Show History details
          </button>
        </div>
      </div>

      {/* Content */}
      {active === 'upload'  && <OpeningBalanceBulkExcel />}
      {active === 'history' && <HistoryOpeningBalanceBulk />}

    </div>
  )
}

export default OpeningBalanceToggle