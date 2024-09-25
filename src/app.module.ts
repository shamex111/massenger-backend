import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PersonalChatModule } from './personal-chat/personal-chat.module';
import { GroupModule } from './group/group.module';
import { ChannelModule } from './channel/channel.module';
import { MessageModule } from './message/message.module';
import { NotificationModule } from './notification/notification.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PersonalChatModule,
    GroupModule,
    ChannelModule,
    MessageModule,
    NotificationModule,
    FileModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', 
    }),
  ],

})
export class AppModule {}
