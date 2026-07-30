"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const fmtCurrency = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtCompact = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 34,
    paddingBottom: 50,
    paddingHorizontal: 32,
    fontSize: 10.5,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#7c3aed",
    justifyContent: "center",
    alignItems: "center",
  },
  brandIconText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  brandSub: {
    marginTop: 2,
    fontSize: 9,
    color: "#6b7280",
  },
  receiptBox: {
    alignItems: "flex-end",
  },
  receiptLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 8.5,
    fontWeight: "bold",
  },
  badgeViolet: {
    backgroundColor: "#f3e8ff",
    color: "#6d28d9",
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  badgeAmber: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  section: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },
  sectionSub: {
    fontSize: 8.5,
    color: "#6b7280",
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    width: "23.4%",
    borderRadius: 10,
    padding: 10,
  },
  summaryLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  violetCard: {
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  greenCard: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  amberCard: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  blueCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  violetText: { color: "#6d28d9" },
  greenText: { color: "#15803d" },
  amberText: { color: "#b45309" },
  blueText: { color: "#1d4ed8" },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoBlock: {
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 10.5,
    color: "#111827",
    fontWeight: "bold",
  },
  distributionCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  distributionHead: {
    padding: 10,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distributionHeadLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  smallTag: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 999,
  },
  primaryTag: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  secondaryTag: {
    backgroundColor: "#f3e8ff",
    color: "#7e22ce",
  },
  amountTag: {
    backgroundColor: "#ecfdf5",
    color: "#15803d",
    fontSize: 9,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  th: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 7.8,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  td: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 9,
    color: "#1f2937",
  },
  colMonth: { width: "17%" },
  colBill: { width: "18%", textAlign: "right" },
  colOutstanding: { width: "18%", textAlign: "right" },
  colAllocated: { width: "18%", textAlign: "right" },
  colRemaining: { width: "18%", textAlign: "right" },
  colStatus: { width: "11%", textAlign: "center" },
  paidText: { color: "#15803d", fontWeight: "bold" },
  partialText: { color: "#b45309", fontWeight: "bold" },
  unpaidText: { color: "#dc2626", fontWeight: "bold" },
  footer: {
    position: "absolute",
    left: 32,
    right: 32,
    bottom: 18,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#6b7280",
  },
  pageNumber: {
    fontSize: 8,
    color: "#6b7280",
  },
});

const getStatusLabel = (remainingAdvance) => {
  return Number(remainingAdvance || 0) <= 0
    ? "Fully Allocated"
    : "Advance Remaining";
};

const getMethodLabel = (mode) => {
  if (!mode) return "Unknown";
  if (mode === "CHEQUE") return "Cheque";
  return mode;
};

const getBillingStatusTextStyle = (status) => {
  if (status === "PAID") return styles.paidText;
  if (status === "PARTIAL") return styles.partialText;
  return styles.unpaidText;
};

const TransactionPdfDocument = ({ details }) => {
  const meta = details?.meta || {};
  const paymentMeta = meta?.meta || {};
  const distribution = Array.isArray(details?.distribution)
    ? details.distribution
    : [];

  const paymentMetaList = [
    {
      label: "Reference No.",
      value: meta?.referenceNumber || paymentMeta?.referenceNumber || "-",
    },
    {
      label: "Bank Name",
      value: meta?.bankName || paymentMeta?.bankName || "-",
    },
    {
      label: "Remarks",
      value: meta?.remarks || "-",
    },
    {
      label: "Total Orders",
      value:
        meta?.totalOrders != null ? fmtCompact(meta.totalOrders) : "-",
    },
  ];

  return (
    <Document title={`Transaction-${meta?._id || "Receipt"}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.headerTop}>
            <View style={styles.brandWrap}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}></Text>
              </View>
              <View>
                <Text style={styles.brandTitle}>Transaction Receipt</Text>
              </View>
            </View>

            <View style={styles.receiptBox}>
 
              <Text style={styles.receiptTitle}>
                {meta?.companyGroupId?.companyName || "Company"}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <Text style={[styles.badge, styles.badgeViolet]}>
              Payment Mode: {getMethodLabel(meta?.paymentMode)}
            </Text>
            <Text style={[styles.badge, Number(meta?.remainingAdvance || 0) <= 0 ? styles.badgeGreen : styles.badgeAmber]}>
              Status: {getStatusLabel(meta?.remainingAdvance)}
            </Text>
            <Text style={[styles.badge, styles.badgeViolet]}>
              Cycle: {MONTH_NAMES[(meta?.month || 1) - 1]} {meta?.year || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <Text style={styles.sectionSub}>
            High-level financial overview of the receipt allocation
          </Text>

          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.violetCard]}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={[styles.summaryValue, styles.violetText]}>
                 {fmtCurrency(meta?.totalAmount)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.greenCard]}>
              <Text style={styles.summaryLabel}>Allocated</Text>
              <Text style={[styles.summaryValue, styles.greenText]}>
                 {fmtCurrency(meta?.totalAllocated)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.amberCard]}>
              <Text style={styles.summaryLabel}>Advance</Text>
              <Text style={[styles.summaryValue, styles.amberText]}>
                 {fmtCurrency(meta?.remainingAdvance)}
              </Text>
            </View>

            <View style={[styles.summaryCard, styles.blueCard]}>
              <Text style={styles.summaryLabel}>Entries</Text>
              <Text style={[styles.summaryValue, styles.blueText]}>
                {fmtCompact(meta?.totalEntries)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <Text style={styles.sectionSub}>
            Company, billing cycle, creator, and payment information
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>
                {meta?.companyGroupId?.companyName || "-"}
              </Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Payment Date</Text>
              <Text style={styles.infoValue}>{formatDate(meta?.paymentDate)}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Payment Mode</Text>
              <Text style={styles.infoValue}>{getMethodLabel(meta?.paymentMode)}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Allocation Type</Text>
              <Text style={styles.infoValue}>{meta?.allocationType || "-"}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Billing Cycle</Text>
              <Text style={styles.infoValue}>
                {MONTH_NAMES[(meta?.month || 1) - 1]} {meta?.year || "-"}
              </Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Created By</Text>
              <Text style={styles.infoValue}>{meta?.createdBy?.name || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Meta</Text>
          <Text style={styles.sectionSub}>
            Bank references, notes, and receipt-linked metadata
          </Text>

          <View style={styles.infoGrid}>
            {paymentMetaList.map((item, index) => (
              <View style={styles.infoBlock} key={`${item.label}-${index}`}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribution Breakdown</Text>
          <Text style={styles.sectionSub}>
            Order-wise allocation and billing settlement mapping
          </Text>

          {distribution.length ? (
            distribution.map((group, index) => {
              const isPrimary = group?.circuitKey?.includes("primary");
              const isSecondary = group?.circuitKey?.includes("secondary");

              return (
                <View style={styles.distributionCard} key={`${group?.orderId}-${index}`} wrap={false}>
                  <View style={styles.distributionHead}>
                    <View style={styles.distributionHeadLeft}>
                      <Text style={styles.orderTitle}>Order Id :{" "}{group?.orderId || "-"}</Text>
                      {isPrimary ? (
                        <Text style={[styles.smallTag, styles.primaryTag]}>Primary</Text>
                      ) : null}
                      {isSecondary ? (
                        <Text style={[styles.smallTag, styles.secondaryTag]}>Secondary</Text>
                      ) : null}
                    </View>

                    <Text style={styles.amountTag}>
                      Allocated  {fmtCurrency(group?.amount)}
                    </Text>
                  </View>

                  <View style={styles.table}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.th, styles.colMonth]}>Month</Text>
                      <Text style={[styles.th, styles.colBill]}>Current Bill</Text>
                      <Text style={[styles.th, styles.colOutstanding]}>Outstanding</Text>
                      <Text style={[styles.th, styles.colAllocated]}>Allocated</Text>
                      <Text style={[styles.th, styles.colRemaining]}>Remaining</Text>
                      <Text style={[styles.th, styles.colStatus]}>Status</Text>
                    </View>

                    {(group?.billings || []).map((billing, billingIndex) => (
                      <View style={styles.tableRow} key={`${billing?.projectionId}-${billingIndex}`}>
                        <Text style={[styles.td, styles.colMonth]}>
                          {MONTH_NAMES[(billing?.month || 1) - 1]} {billing?.year}
                        </Text>
                        <Text style={[styles.td, styles.colBill]}>
                           {fmtCurrency(billing?.currentMonthBill)}
                        </Text>
                        <Text style={[styles.td, styles.colOutstanding, styles.unpaidText]}>
                           {fmtCurrency(billing?.outstandingAmount)}
                        </Text>
                        <Text style={[styles.td, styles.colAllocated, styles.paidText]}>
                           {fmtCurrency(billing?.allocatedAmount)}
                        </Text>
                        <Text style={[styles.td, styles.colRemaining, styles.partialText]}>
                           {fmtCurrency(billing?.remainingAfter)}
                        </Text>
                        <Text
                          style={[
                            styles.td,
                            styles.colStatus,
                            getBillingStatusTextStyle(billing?.status),
                          ]}
                        >
                          {billing?.status || "-"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.infoBlock}>
              <Text style={styles.infoValue}>No distribution records found</Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Customer copy • {meta?.companyGroupId?.companyName || "Company"}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default TransactionPdfDocument;