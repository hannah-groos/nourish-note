import { NextResponse } from "next/server";
import { insertEntry, getEntry } from "@/actions/entries";

// Ensure this route runs dynamically and receives auth cookies
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rawJournalText } = await request.json();
    if (!rawJournalText || typeof rawJournalText !== "string") {
      return NextResponse.json(
        { error: "rawJournalText is required" },
        { status: 400 }
      );
    }

    const { data, error } = await insertEntry(rawJournalText);
    if (error) {
      console.error("/api/entries POST error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("/api/entries POST exception:", err);
    return NextResponse.json({ error: "Failed to insert entry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await getEntry();
    if (error) {
      console.error("/api/entries GET error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("/api/entries GET exception:", err);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}
