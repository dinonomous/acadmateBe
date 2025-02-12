import axios from "axios";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

// Define TimetableRow type
interface TimetableRow {
  Date: string;
  Day: string;
  DayOrder: string;
  Event: string;
}

// Function to decode encoded strings
function decodeEncodedString(encodedString: string): string {
  return encodedString.replace(
    /\\x([0-9A-Fa-f]{2})/g,
    (match: string, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
}

// Function to get calendar data
export async function Calender(req: Request, res: Response) {
  try {
    const cookies = (req as any).session?.cookies || "";

    // Fetch data from the target URL
    const timetableResponse = await axios.get(
      "https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Academic_Planner_2024_25_EVEN",
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Cookie: cookies,
          Host: "academia.srmist.edu.in",
          Origin: "https://academia.srmist.edu.in",
          Referer: "https://academia.srmist.edu.in/",
        },
      }
    );

    if (timetableResponse.status === 200 && timetableResponse.data) {
      const decodedHTML = decodeEncodedString(timetableResponse.data);
      const $ = cheerio.load(decodedHTML);
      const tables = $("table");

      if (tables.length === 0) {
        return res.status(404).json({ error: "Timetable data not found" });
      }

      // Final response structure: { [month: string]: TimetableRow[] }
      const response: { [month: string]: TimetableRow[] } = {};
      const allMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      // Process each table and each row
      tables.each((_, table) => {
        $(table)
          .find("tr")
          .each((_, row) => {
            const cells = $(row)
              .find("td")
              .toArray()
              .map((cell) => $(cell).text().trim());

            // Skip rows that don't have enough cells for at least one month group.
            if (cells.length < 4) return;

            // Each month group occupies 4 data cells plus one gap cell (except possibly the last group)
            // So number of months = floor((cells.length + 1) / 5)
            const numMonths = Math.floor((cells.length + 1) / 5);

            for (let i = 0; i < numMonths; i++) {
              const startIndex = i * 5;
              if (cells.length >= startIndex + 4) {
                const date = cells[startIndex] || "";
                const day = cells[startIndex + 1] || "";
                const event = cells[startIndex + 2] || "";
                const dayOrder = cells[startIndex + 3] || "";

                // Only create an entry if at least one key piece of data is present
                if (date || event) {
                  const monthName =
                    i < allMonthNames.length
                      ? allMonthNames[i]
                      : `Month ${i + 1}`;
                  if (!response[monthName]) response[monthName] = [];
                  response[monthName].push({
                    Date: date,
                    Day: day,
                    DayOrder: dayOrder,
                    Event: event,
                  });
                }
              }
            }
          });
      });

      return res.status(200).json(response);
    } else {
      return res
        .status(timetableResponse.status)
        .json({ error: "HTML content not found or request failed" });
    }
  } catch (error) {
    console.error("Error fetching timetable data:", error);
    return res.status(500).json({ message: "Error fetching timetable data" });
  }
}
