// inquiry.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
} from '../common/schemas/invoice-message.schema';
import { Chat, ChatDocument } from '../common/schemas/chat.schema';
import { CreateMessageDto } from '../common/dto/invoice-message.dto';
import { Inquiry, InquiryDocument } from '../common/schemas/inquiry.schema';

@Injectable()
export class InquiryService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Inquiry.name) private inquiryModel: Model<InquiryDocument>,
  ) {}

  async ensureChatForInvoice(
    invoiceId: string,
    senderId: string,
  ): Promise<ChatDocument> {
    const invoiceObjId = new Types.ObjectId(invoiceId);
    let chat = (await this.chatModel
      .findOne({ invoiceId: invoiceObjId })
      .exec()) as ChatDocument | null;
    if (!chat) {
      const inquiry = await this.inquiryModel
        .findOne({ _id: new Types.ObjectId(invoiceId) })
        .exec();
      if (inquiry) {
        chat = await this.chatModel.create({
          invoiceId: invoiceObjId,
          participants: [
            new Types.ObjectId(senderId),
            new Types.ObjectId(inquiry.employee),
          ],
          lastMessage: '',
          lastMessageAt: new Date(),
        } as ChatDocument);
      } else throw new InternalServerErrorException();
    }
    return chat;
  }

  async createMessage(dto: CreateMessageDto) {
    // Resolve chatId
    let chatId: Types.ObjectId;
    if (dto.chatId) {
      chatId = new Types.ObjectId(dto.chatId);
    } else if (dto.invoiceId) {
      const chat = await this.ensureChatForInvoice(dto.invoiceId, dto.senderId);
      chatId = chat._id as Types.ObjectId;
    } else {
      throw new Error('Either chatId or invoiceId is required');
    }

    // Create message doc

    const msgDoc = new this.messageModel({
      _id: new Types.ObjectId(),
      chatId,
      senderId: new Types.ObjectId(dto.senderId),
      senderName: dto.senderName,
      text: dto.text,
      createdAt: new Date(),
    });

    const saved = await msgDoc.save();

    // Update chat metadata
    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessage: dto.text,
      lastMessageAt: new Date(),
      $addToSet: { participants: new Types.ObjectId(dto.senderId) },
    });

    return saved.toObject();
  }

  async findMessagesByChatId(chatId: string, limit = 50, before?: string) {
    const q: FilterQuery<MessageDocument> = {
      chatId: new Types.ObjectId(chatId),
    };
    if (before) q._id = { $lt: new Types.ObjectId(before) };

    const rows = await this.messageModel
      .find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return rows.reverse();
  }

  async findMessagesByInvoiceId(
    invoiceId: string,
    limit = 50,
    before?: string,
  ) {
    const chat = await this.chatModel
      .findOne({ invoiceId: new Types.ObjectId(invoiceId) })
      .exec();
    if (!chat) return [];
    return this.findMessagesByChatId(
      (chat._id as Types.ObjectId).toString(),
      limit,
      before,
    );
  }

  async findChatsForEmployee(employeeId: string) {
    const obj = new Types.ObjectId(employeeId);
    return this.chatModel
      .find({ participants: obj })
      .populate('invoiceId participants')
      .lean()
      .exec();
  }
}
