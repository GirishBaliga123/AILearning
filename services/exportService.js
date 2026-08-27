'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function exportTransactionsPDF({ transactions, filters, totalExpenses, totalIncome }) {
  const doc = new jsPDF();
  const now = new Date();
  doc.setFontSize(20); doc.setTextColor(31, 41, 55); doc.text('MyBillLedger', 14, 20);
  doc.setFontSize(10); doc.setTextColor(107, 114, 128); doc.text('Expense Tracker Report', 14, 27);
  doc.text(`Generated: ${now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 33);
  let filterText = 'All transactions';
  if (filters) { const p = []; if (filters.startDate) p.push(`From: ${filters.startDate}`); if (filters.endDate) p.push(`To: ${filters.endDate}`); if (filters.type) p.push(`Type: ${filters.type}`); if (p.length > 0) filterText = p.join(' | '); }
  doc.setFontSize(9); doc.text(filterText, 14, 40);
  doc.setFontSize(12); doc.setTextColor(31, 41, 55); doc.text('Summary', 14, 50);
  doc.setFontSize(10); doc.setTextColor(107, 114, 128);
  doc.text(`Total Expenses: Rs. ${(totalExpenses||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, 14, 56);
  doc.text(`Total Income: Rs. ${(totalIncome||0).toLocaleString('en-IN',{minimumFractionDigits:2})}`, 14, 62);
  doc.text(`Net Balance: Rs. ${((totalIncome||0)-(totalExpenses||0)).toLocaleString('en-IN',{minimumFractionDigits:2})}`, 14, 68);
  doc.text(`Transactions: ${transactions.length}`, 14, 74);
  const tableData = transactions.map(t => [new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}), t.description, t.category?.name||'-', t.type, `Rs. ${parseFloat(t.amount).toLocaleString('en-IN',{minimumFractionDigits:2})}`]);
  autoTable(doc, { startY: 82, head: [['Date','Description','Category','Type','Amount']], body: tableData, headStyles: { fillColor: [59,130,246], textColor: 255, fontSize: 9 }, bodyStyles: { fontSize: 8 }, alternateRowStyles: { fillColor: [249,250,251] }, margin: { left: 14, right: 14 } });
  const pc = doc.getNumberOfPages(); for (let i=1;i<=pc;i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(156,163,175); doc.text(`Page ${i} of ${pc} | MyBillLedger`, doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight()-10, {align:'center'}); }
  doc.save(`MyBillLedger_Transactions_${now.toISOString().split('T')[0]}.pdf`);
}

export function exportMonthlyReportPDF({ summary, categoryBreakdown, monthlyTrend, month, year }) {
  const doc = new jsPDF();
  doc.setFontSize(20); doc.setTextColor(31, 41, 55); doc.text('MyBillLedger', 14, 20);
  doc.setFontSize(14); doc.setTextColor(59, 130, 246); doc.text(`Monthly Report \u2014 ${MONTHS[month-1]} ${year}`, 14, 28);
  doc.setFontSize(9); doc.setTextColor(107, 114, 128); doc.text(`Generated: ${new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}`, 14, 34);
  doc.setFontSize(12); doc.setTextColor(31, 41, 55); doc.text('Summary', 14, 46);
  const sd = [['Total Expenses',`Rs. ${summary.totalExpenses.toLocaleString('en-IN',{minimumFractionDigits:2})}`],['Transactions',summary.transactionCount.toString()],['Avg/Day',`Rs. ${summary.averagePerDay.toLocaleString('en-IN',{minimumFractionDigits:2})}`],['Highest Day',`Day ${summary.highestDay.day}`],['vs Last Month',`${summary.monthChange>0?'+':''}${summary.monthChange}%`]];
  autoTable(doc, { startY: 50, body: sd, theme: 'plain', bodyStyles: { fontSize: 10 }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }, margin: { left: 14 } });
  if (categoryBreakdown?.length > 0) { const catY = doc.lastAutoTable.finalY + 10; doc.setFontSize(12); doc.text('Categories', 14, catY); autoTable(doc, { startY: catY+4, head:[['Category','Amount','%']], body: categoryBreakdown.map(c => [`${c.icon} ${c.name}`, `Rs. ${c.total.toLocaleString('en-IN',{minimumFractionDigits:2})}`, `${Math.round((c.total/summary.totalExpenses)*100)}%`]), headStyles:{fillColor:[59,130,246],textColor:255,fontSize:9}, bodyStyles:{fontSize:9}, margin:{left:14} }); }
  if (monthlyTrend?.length > 0) { const tY = doc.lastAutoTable.finalY + 10; doc.setFontSize(12); doc.text('6-Month Trend', 14, tY); autoTable(doc, { startY: tY+4, head:[['Month','Expenses','Income']], body: monthlyTrend.map(m => [m.label, `Rs. ${m.expenses.toLocaleString('en-IN',{minimumFractionDigits:2})}`, `Rs. ${m.income.toLocaleString('en-IN',{minimumFractionDigits:2})}`]), headStyles:{fillColor:[59,130,246],textColor:255,fontSize:9}, bodyStyles:{fontSize:9}, margin:{left:14} }); }
  const pc = doc.getNumberOfPages(); for (let i=1;i<=pc;i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(156,163,175); doc.text(`Page ${i} of ${pc} | MyBillLedger`, doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight()-10, {align:'center'}); }
  doc.save(`MyBillLedger_Report_${MONTHS[month-1]}_${year}.pdf`);
}
