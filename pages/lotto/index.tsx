import React, { useEffect, useState } from "react";
import * as fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import * as csvParser from "csv-parser";
import { readModifyWrite } from "./utils";
import { Line, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  PolarAreaController,
  RadialLinearScale,
  ArcElement,
  Tooltip,
} from "chart.js";
ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  PolarAreaController,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Legend,
  Tooltip
);

ChartJS.defaults.font.size = 11;
export default function Page({ csv }) {
  const [rows, setRows] = useState<any>({});
  const [rowsRadar, setRowsRadar] = useState<any>({});
  const fetchDataChart = async () => {
    function countDuplicates(arr) {
      let counts = {};
      arr.forEach((num) => {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
      });
      return counts;
    }

    const lastTwoDigits = csv;

    const counts: any = countDuplicates(lastTwoDigits);

    setRows(counts);
  };
  const fetchDataRadar = async () => {
    const rangeCounts = {
      "Range 0-5": 0,
      "Range 6-10": 0,
      "Range 11-15": 0,
      "Range 16-20": 0,
      "Range 21-25": 0,
      "Range 26-30": 0,
      "Range 31-35": 0,
      "Range 36-40": 0,
      "Range 41-45": 0,
      "Range 46-50": 0,
      "Range 51-55": 0,
      "Range 56-60": 0,
      "Range 61-65": 0,
      "Range 66-70": 0,
      "Range 71-75": 0,
      "Range 76-80": 0,
      "Range 81-85": 0,
      "Range 86-90": 0,
      "Range 91-95": 0,
      "Range 96-100": 0,
      // Add more ranges if necessary
    };

    function categorizeAndCount(numbers: string[]) {
      numbers.forEach((num) => {
        const value = parseInt(num);
        if (value >= 0 && value <= 5) {
          rangeCounts["Range 0-5"]++;
        } else if (value >= 6 && value <= 10) {
          rangeCounts["Range 6-10"]++;
        } else if (value >= 11 && value <= 15) {
          rangeCounts["Range 11-15"]++;
        } else if (value >= 16 && value <= 20) {
          rangeCounts["Range 16-20"]++;
        } else if (value >= 21 && value <= 25) {
          rangeCounts["Range 21-25"]++;
        } else if (value >= 26 && value <= 30) {
          rangeCounts["Range 26-30"]++;
        } else if (value >= 31 && value <= 35) {
          rangeCounts["Range 31-35"]++;
        } else if (value >= 36 && value <= 40) {
          rangeCounts["Range 36-40"]++;
        } else if (value >= 41 && value <= 45) {
          rangeCounts["Range 41-45"]++;
        } else if (value >= 46 && value <= 50) {
          rangeCounts["Range 46-50"]++;
        } else if (value >= 51 && value <= 55) {
          rangeCounts["Range 51-55"]++;
        } else if (value >= 56 && value <= 60) {
          rangeCounts["Range 56-60"]++;
        } else if (value >= 61 && value <= 65) {
          rangeCounts["Range 61-65"]++;
        } else if (value >= 66 && value <= 70) {
          rangeCounts["Range 66-70"]++;
        } else if (value >= 71 && value <= 75) {
          rangeCounts["Range 71-75"]++;
        } else if (value >= 76 && value <= 80) {
          rangeCounts["Range 76-80"]++;
        } else if (value >= 81 && value <= 85) {
          rangeCounts["Range 81-85"]++;
        } else if (value >= 86 && value <= 90) {
          rangeCounts["Range 86-90"]++;
        } else if (value >= 91 && value <= 95) {
          rangeCounts["Range 91-95"]++;
        } else if (value >= 96 && value <= 100) {
          rangeCounts["Range 96-100"]++;
        }
        // Add more else if conditions for additional ranges if needed
      });
    }

    // Example usage:
    const data = csv;
    categorizeAndCount(data);

    console.log(rangeCounts);

    // Count numbers in each range
    categorizeAndCount(csv);
    setRowsRadar(rangeCounts);
  };
  useEffect(() => {
    fetchDataChart();
    fetchDataRadar();
  }, []);

  return (
    <>
      <div className="container">
        <div className="">
          <div>เลขท้าย2ตัว</div>
          <div>
            <Bar
              options={
                {
                  borderWidth: 1,
                  borderRadius: 7,
                  categoryPercentage: 0.7,
                  gridLines: {
                    display: false, // Hides grid lines
                  },
                  layout: {
                    padding: {
                      top: 20,
                      right: 10,
                      bottom: 20,
                      left: 10,
                    },
                  },

                  elements: {
                    bar: {
                      borderWidth: 2,
                    },
                  },
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right" as const, // Position: top-right
                    },

                    title: {
                      display: true,
                      text: "Chart.js Horizontal Bar Chart",
                    },
                  },
                } as any
              }
              data={
                {
                  labels: Object.keys(rows),
                  datasets: [
                    {
                      label: "เลขท้ายสองตัว",
                      data: Object.values(rows),
                      backgroundColor: "rgba(54, 162, 235, 0.5)", // Blue with transparency
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 1,
                    },
                  ],
                } as any
              }
            />
          </div>

          <div className="flex justify-center items-center w-full h-full bg-color-black">
            <Radar
              options={
                {
                  type: "radar",
                  options: {
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Chart.js Radar Chart",
                      },
                    },
                  },
                } as any
              }
              data={{
                labels: Object.keys(rowsRadar),
                datasets: [
                  {
                    label: "เลขท้ายสองตัว",
                    data: Object.values(rowsRadar),
                    backgroundColor: "red", // Blue with transparency
                    borderColor: "red",
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
export async function getStaticProps() {
  const result = await readModifyWrite();
  return {
    props: {
      csv: result,
    },
  };
}
