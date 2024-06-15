import * as fs from 'fs';
import { createObjectCsvWriter } from "csv-writer";
import * as csvParser from "csv-parser";
import { createReadStream } from 'fs';

import { promisify } from 'util';

export async function readModifyWrite() {
    const inputFile = process.cwd() + "/data/lotto.csv";
    try {
        const rows: any[] = [];

        // Read CSV file and modify rows
        await new Promise<void>((resolve, reject) => {

            createReadStream(inputFile, "utf8")
                // @ts-ignore
                .pipe(csvParser())
                .on("data", (row: any) => {
                    // Example modification: Keep columns 0 to 7
                    const modifiedRow: any = Object.values(row)[6];
                    rows.push(modifiedRow);
                })
                .on("end", () => {
                    resolve(); // Resolve the promise when parsing ends
                })
                .on("error", (err: any) => {
                    reject(err); // Reject the promise on error
                });
        });

        return rows; // Return the modified rows array
    } catch (error) {
        console.log(error);
        throw error; // Re-throw the error to handle it elsewhere if needed
    }
}

