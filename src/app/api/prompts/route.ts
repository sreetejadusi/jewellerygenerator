import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const promptsFilePath = path.join(process.cwd(), 'prompts.json');

export async function GET() {
  try {
    const fileContents = await fs.readFile(promptsFilePath, 'utf8');
    const prompts = JSON.parse(fileContents);
    return NextResponse.json(prompts);
  } catch (error: any) {
    console.error('Error reading prompts:', error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const prompts = await request.json();
    await fs.writeFile(promptsFilePath, JSON.stringify(prompts, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error writing prompts:', error);
    return NextResponse.json({ error: 'Failed to write prompts' }, { status: 500 });
  }
}
