import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { ParametersModule } from './parameters/parameters.module';
import { SubParametersModule } from './sub-parameters/sub-parameters.module';
import { FormsModule } from './forms/forms.module';
import { ScoresModule } from './scores/scores.module';
import { ViolationsModule } from './violations/violations.module';
import { CrsModule } from './crs/crs.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditModule } from './audit/audit.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { SystemModule } from './system/system.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'apps', 'web', 'public'),
      serveRoot: '/static', // Moved web public to /static to avoid conflict if needed, or keep as is?
      // Actually, my plan said: "Import ServeStaticModule to serve uploads from apps/api/uploads at /api/uploads"
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/api/uploads',
    }),
    AuthModule,
    PrismaModule,
    StudentsModule,
    ParametersModule,
    SubParametersModule,
    FormsModule,
    ScoresModule,
    ViolationsModule,
    CrsModule,
    AnalyticsModule,
    AuditModule,
    DashboardsModule,
    SystemModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
