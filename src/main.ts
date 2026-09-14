import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  hbs.registerHelper('moeda', (valor: number) =>
    (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  );
  hbs.registerHelper('numero', (valor: number) =>
    (valor ?? 0).toLocaleString('pt-BR'),
  );
  hbs.registerHelper('data', (valor: string) => {
    if (!valor) return '-';
    const [ano, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${ano}`;
  });
  hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  hbs.registerHelper('statusClasse', (valor: string) =>
    (valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-'),
  );

  await app.listen(3000);
  console.log('Aplicação rodando em http://localhost:3000');
}
bootstrap();
