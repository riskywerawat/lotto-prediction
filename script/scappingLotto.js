// Import required modules
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const dfd = require('danfojs-node');

// Function to parse date
function getDate(url) {
    const parts = url.split('/');
    const filteredParts = parts.filter(part => part !== '');
    const dateStr = filteredParts[filteredParts.length - 1];
    const date = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = (parseInt(dateStr.substring(4, 8)) - 543).toString();
    return `${year}-${month}-${date}`;
}

// Function to get the archive page data
async function getArchivePage(url) {
    console.log(`Page = ${url}`);
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            let nextPageUrl = "";
            const lotto = [];

            $('a.pagination__item--next').each((index, element) => {
                nextPageUrl = $(element).attr('href');
            });

            const divContent = $('div.box-cell.box-cell--lotto.content');

            divContent.find('a').each((index, element) => {
                const lottoUrl = $(element).attr('href');
                if (lottoUrl.includes("/lotto/check/")) {
                    lotto.push(lottoUrl);
                }
            });

            return { archiveList: lotto, nextPageUrl: nextPageUrl };
        } else {
            console.log(`Failed to retrieve the page. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error fetching the archive page: ${error.message}`);
    }
}

// Function to scrape lotto data
async function scappingLotto(url) {
    if (url === 'https://news.sanook.com/lotto/check/ผลสลากกินแบ่งรัฐบาลงวดประจำวันที่1สิงหาคม2552/') {
        // Adjust for specific incorrect URL
        url = 'https://news.sanook.com/lotto/check/01082552/';
    }

    try {
        const response = await axios.get(url);
        const date = getDate(url);
        console.log(`${date} = ${url}`);

        const row = {
            date: date,
            prize_1st: '',
            prize_pre_3digit: [],
            prize_sub_3digits: [],
            prize_2digits: [],
            nearby_1st: [],
            prize_2nd: [],
            prize_3rd: [],
            prize_4th: [],
            prize_5th: []
        };

        if (response.status === 200) {
            const $ = cheerio.load(response.data);

            const columns = $('div.lottocheck__column');
            if (columns.length) {
                let i = 0;
                const prefix = [];
                const subfix = [];
                let first = '';
                let last2digit = '';
                columns.each((index, col) => {
                    $(col).find('strong').each((index, num) => {
                        if (i === 0) {
                            first = $(num).text();
                        } else if (i === 1) {
                            prefix.push($(num).text());
                        } else if (i === 2) {
                            subfix.push($(num).text());
                        } else if (i === 3) {
                            last2digit = $(num).text();
                        }
                    });
                    i += 1;
                });
                row.prize_1st = first;
                row.prize_pre_3digit = prefix;
                row.prize_sub_3digits = subfix;
                row.prize_2digits = last2digit;
            }

            const nearby = [];
            $('div.lottocheck__sec--nearby strong.lotto__number').each((index, ele) => {
                nearby.push($(ele).text());
            });
            row.nearby_1st = nearby;

            i = 0;
            $('div.lottocheck__sec').each((index, section) => {
                if (i === 0) {
                    i += 1;
                    return;
                }

                const nums = [];
                $(section).find('div.lottocheck__box-item span.lotto__number').each((index, span) => {
                    nums.push($(span).text());
                });

                if (i === 1) row.prize_2nd = nums;
                else if (i === 2) row.prize_3rd = nums;
                else if (i === 3) row.prize_4th = nums;
                else if (i === 4) row.prize_5th = nums;
                i += 1;
            });

            return row;
        } else {
            console.log(`Failed to retrieve the page. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error scraping lotto data: ${error.message}`);
    }
}

// Main function to run the scraping process
(async function() {
    const archiveUrl = "https://news.sanook.com/lotto/archive/";
    let header = true;

    const columns = ['date', 'prize_1st', 'prize_pre_3digit', 'prize_sub_3digits', 'prize_2digits', 'nearby_1st', 'prize_2nd', 'prize_3rd', 'prize_4th', 'prize_5th'];
    let df = new dfd.DataFrame([], { columns: columns });

    const csvPath = path.join(__dirname, 'lotto.csv');
    const parquetPath = path.join(__dirname, 'lotto.parquet');

    if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
    }

    if (fs.existsSync(parquetPath)) {
        fs.unlinkSync(parquetPath);
    }

    let archive = await getArchivePage(archiveUrl);

    while (archive) {
        for (const page of archive.archiveList) {
            const newRow = await scappingLotto(page);
            if (newRow) {
                const newDf = new dfd.DataFrame([newRow], { columns: columns });
                if (df.$data.length === 0) {
                    df = newDf;
                } else {
                    df = dfd.concat({ dfList: [df, newDf] });
                }
                await dfd.toCSV(df, { filePath: csvPath, index: false, header: header });
                header = false;
            }
        }

        if (!archive.nextPageUrl) {
            await dfd.toParquet(df, { filePath: parquetPath });
            break;
        } else {
            archive = await getArchivePage(archive.nextPageUrl);
        }
    }
})();
