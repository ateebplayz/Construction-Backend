import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InquiryService } from './inquiry.service';
import { CreateMessageDto } from '../common/dto/invoice-message.dto';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../common/guards/ws-jwt-guard.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // adjust for security
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly inquiryService: InquiryService) {}

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  // 🔹 Join a room (per invoice)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() invoiceId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(invoiceId);
    console.log(`👥 Client ${client.id} joined room ${invoiceId}`);

    // Send chat history back
    const history =
      await this.inquiryService.findMessagesByInvoiceId(invoiceId);
    client.emit('roomJoined', { invoiceId, history });
  }

  // 🔹 Send new message
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user; // comes from WsJwtGuard

    const enrichedDto: CreateMessageDto = {
      ...data,
      senderId: user.userId,
      senderName: user.username, // now enforced from JWT
    };

    const saved = await this.inquiryService.createMessage(enrichedDto);

    if (!data.invoiceId) throw new InternalServerErrorException();
    this.server.to(data.invoiceId).emit('newMessage', saved);

    return saved;
  }
}
