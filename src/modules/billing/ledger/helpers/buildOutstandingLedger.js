/**
 * enrichOutstandingLedger
 *
 * Adds two new calculated fields to each row WITHOUT touching any existing
 * backend field (totalBalance, remainingAdjustment, etc.).
 *
 * New fields:
 *   runningOutstanding         – cumulative net charges minus credits so far
 *   outstandingAfterAdjustment – what remains after consuming the full
 *                                adjustment pool (all receipts + credit notes
 *                                + confirmed TDS across all rows)
 *
 * @param {object[]} rows       Raw rows from the API
 * @param {object}   apiTotals  Raw totals block from the API
 * @returns {{ rows: object[], totals: object }}
 */
export const enrichOutstandingLedger = (rows = [], apiTotals = {}) => {

  let runningOutstanding = 0

  // Pre-compute the full future-adjustment pool (sum across ALL rows)
  let adjustmentPool = rows.reduce((sum, row) => {
    return (
      sum
      + (Number(row.received)   || 0)
      + (Number(row.creditNote) || 0)
      + (Number(row.tdsConf)    || 0)
    )
  }, 0)

  let outstandingAfterAdjustment = 0

  const enrichedRows = rows.map((row) => {

    // Charges for this row
    const charges =
      (Number(row.totalPlusGst) || 0)
      + (Number(row.miscPlusGst) || 0)

    // Credits for this row
    const credits =
      (Number(row.received)   || 0)
      + (Number(row.creditNote) || 0)
      + (Number(row.tdsConf)    || 0)

    // Running Outstanding — net cumulative
    runningOutstanding += charges - credits

    // Outstanding After Adjustment — consume from pool greedily
    if (adjustmentPool >= charges) {
      adjustmentPool -= charges
    } else {
      outstandingAfterAdjustment += charges - adjustmentPool
      adjustmentPool = 0
    }

    return {
      ...row,                                                  // ← all existing fields untouched
      runningOutstanding:         Number(runningOutstanding.toFixed(2)),
      outstandingAfterAdjustment: Number(outstandingAfterAdjustment.toFixed(2)),
    }
  })

  const lastRow = enrichedRows[enrichedRows.length - 1]

  return {
    rows: enrichedRows,
    totals: {
      ...apiTotals,                                            // ← all existing totals untouched
      runningOutstanding:         lastRow?.runningOutstanding         || 0,
      outstandingAfterAdjustment: lastRow?.outstandingAfterAdjustment || 0,
    },
  }
}