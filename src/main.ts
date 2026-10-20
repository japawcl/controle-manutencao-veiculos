import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import session from 'express-session';
import hbs from 'hbs';
import { AppModule } from './app.module';
import { mensagensFlash } from './comum/mensagens';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  app.use(
    session({
      secret: process.env.SESSAO_SEGREDO ?? 'controle-manutencao',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(mensagensFlash);

  hbs.registerHelper('moeda', (valor: number) =>
    (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  );
  hbs.registerHelper('numero', (valor: number) =>
    (valor ?? 0).toLocaleString('pt-BR'),
  );
  hbs.registerHelper('data', (valor: string) => {
    if (!valor) return '-';
    const [ano, mes, dia] = String(valor).split('-');
    return `${dia}/${mes}/${ano}`;
  });
  hbs.registerHelper('eq', (a: unknown, b: unknown) => String(a) === String(b));
  hbs.registerHelper('statusClasse', (valor: string) =>
    (valor ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-'),
  );
  hbs.registerHelper('contem', (lista: unknown[], valor: unknown) =>
    Array.isArray(lista) && lista.some((item) => String(item) === String(valor)),
  );

  await app.listen(3000);
  console.log('Aplicação rodando em http://localhost:3000');
}
bootstrap();
