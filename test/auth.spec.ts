import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { getApp } from './helpers';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginUserDto } from 'src/auth/dto';
import { Gender, MusicGenre } from 'src/types';

let app: INestApplication;
let api: supertest.SuperTest<supertest.Test>;
beforeAll(async () => {
  app = await getApp();
  api = supertest(app.getHttpServer());
});

const baseUrl = '/auth';
describe('Testing auth route /auth/register', () => {
  it('POST /auth/register with with required body attributes only', async () => {
    const user: CreateUserDto = {
      email: 'example@email.com',
      username: 'username',
      password: 'password',
    };

    const { body } = await api
      .post(`${baseUrl}/register`)
      .send(user)
      .expect(201);

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('username');
    expect(body).not.toHaveProperty('password');
  });

  it('POST /auth/register with full body attributes', async () => {
    const user: CreateUserDto = {
      email: 'example0@email.com',
      username: 'username0',
      password: 'password',
      firstName: 'firstName',
      lastName: 'lastName',
      birthDate: '1995-01-01',
      favoriteGenre: MusicGenre.Pop,
      gender: Gender.Male,
    };

    const { body } = await api
      .post(`${baseUrl}/register`)
      .send(user)
      .expect(201);

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('username');
    expect(body).not.toHaveProperty('password');

    // Full body attributes checks
    expect(body.gender).toBe(user.gender);
    expect(body.favoriteGenre).toBe(user.favoriteGenre);
    // returns: e.g. "1995-01-01T00:00:00.000Z"
    // expect(body.birthDate).toBe(user.birthDate);
  });
});

describe('Testing auth route /auth/login', () => {
  it('POST /auth/login with correct body', async () => {
    const user: LoginUserDto = {
      username: 'username',
      password: 'password',
    };

    const { body } = await api.post(`${baseUrl}/login`).send(user).expect(200);

    expect(body).toHaveProperty('access_token');
  });
});

describe('Testing auth route /user/profile', () => {
  it('GET /user/profile with correct token', async () => {
    // I'd perfer if this was function in helpers.ts e.g. getUser()
    const res = await api.post(`${baseUrl}/login`).send({
      username: 'username',
      password: 'password',
    });

    const { access_token } = res.body;

    const { body } = await api
      .get(`/user/profile`)
      .set({ Authorization: `Bearer ${access_token}` })
      .expect(200);

    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('username');
    expect(body).not.toHaveProperty('password');
  });

  it('GET /user/profile with incorrect token', async () => {
    const jwtService = app.get(JwtService);
    const fakeToken = await jwtService.signAsync(
      { sub: 1, username: 'username' },
      { expiresIn: '1h', secret: 'secret' },
    );

    await api
      .get(`/user/profile`)
      .set({ Authorization: `Bearer ${fakeToken}` })
      .expect(401);
  });

  it('GET /user/profile with invalid token', async () => {
    await api
      .get(`/user/profile`)
      .set({ Authorization: 'Bearer invalidToken' })
      .expect(401);
  });
});
