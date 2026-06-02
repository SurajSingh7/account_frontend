import { NextResponse } from 'next/server';
import orders from '../../../../../public/mock/orders.json';

// Product metadata
const PRODUCTS = {
  ILL: { productId: '6866518667b328cf0bf8165a', productName: 'Internet Lease Line' },
  GLL: { productId: '68665308a1012d98c72f0ec7', productName: 'Gigantic Lease Line' },
  NLD: { productId: '68665359a1012d98c72f0eca', productName: 'National Long Distance' },
  DIA: { productId: '68c810242383557df1aba903', productName: 'Direct Internet Access' },
};

// Entity metadata
const ENTITIES = {
  WIBRO: { entityId: '6936dce6319864a732c9fee8', entityName: 'WIBRO' },
  GTEL: { entityId: '6936dd4f319864a732c9feea', entityName: 'Gigantic Infotel Private Limited' },
};

function buildSummary(data) {
  const summary = {
    orderType: {
      'NEW-ORDER': { count: 0, label: 'New Order' },
      UPGRADE: { count: 0, label: 'Upgrade' },
      DOWNGRADE: { count: 0, label: 'Downgrade' },
      SHIFT: { count: 0, label: 'Shift' },
    },
    productCode: Object.fromEntries(
      Object.entries(PRODUCTS).map(([code, meta]) => [code, { count: 0, ...meta }])
    ),
    entity: Object.fromEntries(
      Object.entries(ENTITIES).map(([alias, meta]) => [alias, { count: 0, ...meta }])
    ),
  };

  for (const order of data) {
    if (summary.orderType[order.orderType] !== undefined) {
      summary.orderType[order.orderType].count++;
    }
    const code = order.product?.code;
    if (code && summary.productCode[code] !== undefined) {
      summary.productCode[code].count++;
    }
    const alias = order.entity?.alias;
    if (alias && summary.entity[alias] !== undefined) {
      summary.entity[alias].count++;
    }
  }

  return summary;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page      = parseInt(searchParams.get('page')  || '1',  10);
  const limit     = parseInt(searchParams.get('limit') || '50', 10);

  const year            = searchParams.get('year');
  const month           = searchParams.get('month');       // 1-based
  const startDate       = searchParams.get('startDate');
  const endDate         = searchParams.get('endDate');
  const isActiveParam   = searchParams.get('isActive');
  const isTerminate     = searchParams.get('isTerminate'); // "true" → filter by terminateDate

  // When isTerminate=true, all date filters apply on terminateDate instead of operationalDate.
  // Only orders that actually have a terminateDate are included in this mode.
  const useTeminateDate = isTerminate === 'true';

  let filtered = [...orders];

  // --- isActive filter (always applied, independent of date mode) ---
  if (isActiveParam !== null) {
    const isActive = isActiveParam === 'true';
    filtered = filtered.filter((o) => o.isActive === isActive);
  }

  // --- isTerminate=true: only orders that have a terminateDate ---
  if (useTeminateDate) {
    filtered = filtered.filter((o) => !!o.terminateDate);
  }

  // --- Date filter helper ---
  // dateField: which field to read from the order object
  const dateField = useTeminateDate ? 'terminateDate' : 'operationalDate';

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end   = endDate   ? new Date(endDate)   : null;
    filtered = filtered.filter((o) => {
      const d = new Date(o[dateField]);
      if (start && d < start) return false;
      if (end   && d > end)   return false;
      return true;
    });
  } else if (year || month) {
    filtered = filtered.filter((o) => {
      const d = new Date(o[dateField]);
      if (year  && d.getFullYear()  !== parseInt(year,  10)) return false;
      if (month && d.getMonth() + 1 !== parseInt(month, 10)) return false;
      return true;
    });
  }

  const total = filtered.length;

  if (total === 0) {
    return NextResponse.json({
      success: true,
      message: 'No data found',
      data: {
        data: [],
        summary: buildSummary([]),
      },
      pagination: {
        page,
        limit,
        total: 0,
        currentPageTotal: 0,
        totalPages: 0,
        hasPrev: false,
        hasNext: false,
      },
    });
  }

  // --- Pagination ---
  const totalPages = Math.ceil(total / limit);
  const offset     = (page - 1) * limit;
  const paginated  = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    success: true,
    message: 'ok',
    data: {
      data: paginated,
      summary: buildSummary(filtered),
    },
    pagination: {
      page,
      limit,
      total,
      currentPageTotal: paginated.length,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
  });
}