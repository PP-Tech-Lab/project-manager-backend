import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  logger: ['error', 'warn', 'log', 'debug', 'verbose'], // [TODO]: Enable debug levels accordingly between dev, test, prod builds
});
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
