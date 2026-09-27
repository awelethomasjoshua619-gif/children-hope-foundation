import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { sendContactFormNotification, sendContactConfirmation } from '../services/email';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  subject: z.string().trim().min(3, 'Subject is too short').max(120),
  message: z.string().trim().min(10, 'Message is too short').max(2000),
});

export async function submitContact(req: Request, res: Response): Promise<void> {
  const body = schema.parse(req.body);

  await prisma.contactMessage.create({ data: body });

  void sendContactFormNotification(body);
  void sendContactConfirmation({ name: body.name, email: body.email });

  res.status(201).json({ ok: true, message: 'Message received — we will reply within 2 business days.' });
}
