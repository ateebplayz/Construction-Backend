export class CreateMessageDto {
  chatId?: string; // optional: if not provided we can resolve/create chat by invoiceId
  invoiceId?: string; // optional: used to auto-create/find a chat for an invoice
  senderId!: string;
  senderName?: string;
  text!: string;
}
