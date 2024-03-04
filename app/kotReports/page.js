'use client'

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from '../components/Navbar';
import * as XLSX from 'xlsx'; // Import xlsx package

const KotReport = () => {
  // Initialize startDate and endDate with current date
  const currentDate = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  
  const [kotData, setKotData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        const response = await axios.get(`http://192.168.1.40:5000/api/kot/items${
          startDate && endDate
            ? `?startDate=${startDate}&endDate=${endDate}`
            : ''
        }`);
        console.log("Response data:", response.data); // Log response data
        setKotData(response.data.items); // Adjust to access the 'items' property of the response
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]);
  
  useEffect(() => {
    // Set both start and end dates using the getFormattedDate function
    const date = getFormattedDate();
    setStartDate(date);
    setEndDate(date);
  }, []);

  function getFormattedDate() {
    const now = new Date();
    const currentHour = now.getHours();

    // If the current hour is before 3 AM, use the previous day's date
    // Otherwise, use the current date
    if (currentHour < 3) {
      const prevDay = new Date(now);
      prevDay.setDate(prevDay.getDate() - 1);
      const year = prevDay.getFullYear();
      const month = (prevDay.getMonth() + 1).toString().padStart(2, '0');
      const day = prevDay.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const startDateFormatted = formatDate(startDate);
  const endDateFormatted = formatDate(endDate);
  const dateRange =
    startDate && endDate
      ? `${startDateFormatted} - ${endDateFormatted}`
      : "(All Dates)";

  const startDates = formatDate(startDate);

  // Function to export selected date data to Excel
const exportToExcel = () => {
  const filename = 'KOT_Report.xlsx';
  
  // Filter data based on selected start and end dates
  const filteredData = kotData.filter(item => {
    const formattedDate = formatDate(item.date);
    return formattedDate >= formatDate(startDate) && formattedDate <= formatDate(endDate);
  });

  // Format filtered data for Excel
  const formattedData = filteredData.map(item => [formatDate(item.date), item.itemName, item.totalQuantity]);
  
  // Create worksheet and workbook
  const ws = XLSX.utils.aoa_to_sheet([['Date', 'Menu Name', 'Quantity'], ...formattedData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KOT_Report");
  
  // Download Excel file
  XLSX.writeFile(wb, filename);
};

const printReport = () => {
  // Filter kotData based on selected start and end dates
  const filteredData = kotData.filter(item => {
    const formattedDate = formatDate(item.date);
    return formattedDate >= formatDate(startDate) && formattedDate <= formatDate(endDate);
  });

  const printContent = filteredData.map((item) => ({
    date: formatDate(item.date),
    menuName: item.itemName,
    quantity: item.totalQuantity,
  }));


  const printableContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report</title>
      <style>

      @page {
    size: 80(72.1)X 297 mm; /* Set the page size */
    margin: 2mm; /* Adjust the margin as needed */
  }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .report-header {
        margin-top: -11px;
        color: black;
        font-size: 10px;
        padding: 10px;
        text-align: center;
      }
      
      .date-range {
        font-size: 13px;
        margin: -4px 0;
        text-align: left;
      }
      
      .report-content {
        margin-top: 10px;
        width: 100%; /* Make the report content width 100% */
        overflow-x: auto; /* Allow horizontal scrolling if needed */
      }
      
      .table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .table th, .table td {
        padding: 5px; /* Adjust padding as needed */
        font-size: 10px; /* Adjust font size as needed */
        text-align: center;
        border: 1px solid black;
        word-wrap: break-word; /* Allow content to wrap within cells */
        max-width: 100px; /* Limit maximum width of the cell */
        overflow: hidden;
      }
      
      .table .vertical-line {
        border-left: 1px solid black;
        border-right: 1px solid black;
      }
      
      .bg-gray-100 {
        border-bottom: 1px solid black;
        padding: 1px;
      }
      
      .label {
        font-weight: normal;
      }
      
      .value {
        font-weight: normal;
      }
    </style>
    </head>
    <body>
      <div class="report-header">
        KOT Report
      </div>
      <div class="date-range">
        Date Range: ${new Date(startDate).toLocaleDateString('en-GB')} - ${new Date(endDate).toLocaleDateString('en-GB')}
      </div>
      <div class="report-content">
        <table class="table">
          <thead>
            <tr class="bg-gray-100">
              <th class="label">Date</th>
              <th class="vertical-line label">Menu Name</th>
              <th class="vertical-line label">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${printContent
              .map(
                (item) => `
                  <tr class="bg-gray-100">
                    <td class="value">${item.date}</td>
                    <td class="vertical-line value">${item.menuName}</td>
                    <td class="vertical-line value">${item.quantity}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "blank");

  if (!printWindow) {
    alert("Please allow pop-ups to print the report.");
    return;
  }

  printWindow.document.write(printableContent);
  printWindow.document.close();
  printWindow.print();
  printWindow.close();
};
  return (
    <>
    <Navbar />
    <div className="font-sans">
      <h2 className=" mt-12 text-orange-500 font-bold ml-28">KOT Report</h2>
      <div className="flex space-x-4 mt-4 mb-4">
      <label className="mr-2 font-semibold ml-28">Start Date:</label>
          <input
            type="date"
            className="border rounded-md text-gray-700 p-1 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label className="mx-2">End Date:</label>
          <input
            type="date"
            className="border rounded-md text-gray-700 p-1 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button className="text-orange-600 ml-4 font-bold py-1 rounded-full text-sm bg-orange-100 mr-2 px-2 shadow-md" 
          onClick={exportToExcel}>Export to Excel</button>

<button
            className="text-green-600 ml-0 lg:ml-4 font-bold py-1 rounded-full text-sm bg-green-200 mr-2 px-4 shadow-md"
            onClick={printReport}
          >
            Print
          </button>
      </div>
      <div className="max-w-6xl mx-auto">
      <table className="border-collapse border border-gray-300 min-w-full divide-y divide-gray-200">
        <thead className='text-base bg-zinc-100 text-yellow-700 border'>
          <tr className="bg-gray-200 text-center">
            <th className="border p-2">SR No</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Menu Name</th>
            <th className="border p-2">Quantity</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {kotData.map((item, index) => {
            const formattedDate = formatDate(item.date);
            if (!startDate || !endDate || (formattedDate >= formatDate(startDate) && formattedDate <= formatDate(endDate))) {
              return (
                <tr key={index}>
                  <td className="border p-1 text-center">{index +1 }</td>
                  <td className="border p-1 text-center">{formattedDate}</td>
                  <td className="border p-1">{item.itemName}</td>
                  <td className="border p-1 text-center">{item.totalQuantity}</td>
                </tr>
              );
            } else {
              return null;
            }
          })}
        </tbody>
      </table>
      </div>
    </div>
    </>
  );
};

export default KotReport;