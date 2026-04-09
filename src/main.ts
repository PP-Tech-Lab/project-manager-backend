import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // [TODO]: Enable debug levels accordingly between dev, test, prod builds
  });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT')!;

  await app.listen(port);
  console.log('\nNest ready');
  console.log(`Server running on port: ${port}`);
}

bootstrap();
