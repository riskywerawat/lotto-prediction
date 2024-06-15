import * as fs from 'fs';
import { createObjectCsvWriter } from "csv-writer";
import  * as csvParser from "csv-parser";

async function readModifyWrite() {
  const inputFile = process.cwd() + "/data/lotto.csv";
  const outputFile = process.cwd() + "/data/output.csv";

  try {
    const rows: any[] = [];

    // Read CSV file and modify rows
    fs.createReadStream(inputFile, "utf8")
      .pipe(csvParser())
      .on("data", (row) => {
        // Remove columns 8 to n (assuming n is the last column index)
        const modifiedRow: any = Object.values(row).slice(0, 7); // Keep columns 0 to 7

        rows.push(modifiedRow);
      })
      .on("end", () => {
        // Write modified rows to new CSV file
        const csvWriter = createObjectCsvWriter({
          path: outputFile,
          header: Object.keys(rows[0]).map((key, index) => ({
            id: key,
            title: key,
          })),
        });

        csvWriter
          .writeRecords(rows)
          .then(() => console.log("CSV file successfully written"))
          .catch((err) => console.error("Error writing CSV file:", err));
      });
  } catch (error) {
    console.error("Error reading CSV file:", error);
  }
}

readModifyWrite();
