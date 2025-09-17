import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InquiryService } from './inquiry.service';
import { ChatGateway } from './chat.gateway';
import { InquiryController } from './inquiry.controller';
import {
  Message,
  MessageSchema,
} from '../common/schemas/invoice-message.schema';
import { Chat, ChatSchema } from '../common/schemas/chat.schema';
import { Inquiry, InquirySchema } from '../common/schemas/inquiry.schema';
import { User, UserSchema } from '../common/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { jwtKey } from '../config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Inquiry.name, schema: InquirySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: jwtKey,
    }),
  ],
  controllers: [InquiryController],
  providers: [InquiryService, ChatGateway],
  exports: [InquiryService],
})
export class InquiriesModule {}
