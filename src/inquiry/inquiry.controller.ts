import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateMessageDto } from '../common/dto/invoice-message.dto';
import { RequestWithUser } from '../common/types/req.types';
import { JwtAuthGuard } from '../common/guards/jwt-guard.guard';

@Controller('inquiries/chats')
export class InquiryController {
  constructor(private readonly chatService: InquiryService) {}
  @Get('')
  @UseGuards(JwtAuthGuard)
  async getChats(@Req() req: RequestWithUser) {
    const employeeId = req.user.userId;
    if (!employeeId) return [];
    return this.chatService.findChatsForEmployee(employeeId);
  }

  @Get('/inquiry/:invoiceId/messages')
  async getInvoiceMessages(
    @Param('invoiceId') invoiceId: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.chatService.findMessagesByInvoiceId(invoiceId, lim);
  }

  @Post('/inquiry/:invoiceId/messages')
  async postInvoiceMessage(
    @Param('invoiceId') invoiceId: string,
    @Body() body: CreateMessageDto,
  ) {
    body.invoiceId = invoiceId;
    return this.chatService.createMessage(body);
  }

  @Get(':chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.chatService.findMessagesByChatId(chatId, lim);
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  async getUnread(@Req() req: RequestWithUser) {
    return this.chatService.findUnreadChatsForUser(req.user.userId);
  }

  @Post(':chatId/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Req() req: RequestWithUser,
    @Param('chatId') chatId: string,
  ) {
    return this.chatService.markMessagesAsRead(chatId, req.user.userId);
  }
}
