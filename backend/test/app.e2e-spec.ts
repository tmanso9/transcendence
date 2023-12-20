import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { PrismaService } from "../src/prisma/prisma.service";
import * as pactum from 'pactum';

let atCookie = null;
describe('Test test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    // Create testing module
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Initialize app
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true
    }));

    // Start testing application
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => {
    app.close();
  })

  describe('Auth', () => {
    let dto = {
      email: 'test@gmail.com',
      password: 'Bananinha123!',
    };
    
    describe('Signup', () => {
      it('Valid signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201);
      });
      it('Invalid signup - No email', () => {
        return pactum.spec().post('/auth/signup').withBody({password: 'test'}).expectStatus(400);
      });
      it('Invalid signup - No password', () => {
        return pactum.spec().post('/auth/signup').withBody({email: 'test@gmail.com'}).expectStatus(400);
      });
      it('Invalid signup - User already exists', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(403);
      });
    })

    describe('Login', () => {
      it('Invalid login - Invalid password', () => {
        return pactum.spec().post('/auth/login').withBody({email: 'test@gmail.com', password: 'wrong'}).expectStatus(403);
      });
      it('Valid login', async () => {
        const cookie = await pactum.spec().post('/auth/login').withBody(dto).returns((ctx) => {
          return ctx.res.headers['set-cookie'];
        });
        atCookie = cookie[0];
      });
      it('Invalid login - Already logged in', () => {
        return pactum.spec().post('/auth/login').withBody(dto).expectStatus(403);
      });
      it('Invalid login - User does not exist', () => {
        return pactum.spec().post('/auth/login').withBody({email: 'non_existant@gmail.com', password: 'wrong'}).expectStatus(403);
      });
    })
  });

  describe('User', () => {
    describe('View Me', () => {
      it('Invalid Token', () => {
        return pactum.spec().get('/users/me').withCookies('access_token', atCookie).expectStatus(401);
      });
      it('Valid Token', () => {
        console.log(atCookie);
        return pactum.spec().get('/users/me').withCookies('access_token', atCookie).expectStatus(200);
      })
    })
  });

})
