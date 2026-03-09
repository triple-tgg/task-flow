import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    private readonly logger = new Logger(GoogleStrategy.name);

    constructor(private configService: ConfigService) {
        const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
        const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
        const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || '/api/v1/auth/google/callback';

        // Use dummy values if not configured — the guard will reject requests
        super({
            clientID: clientID || 'not-configured',
            clientSecret: clientSecret || 'not-configured',
            callbackURL,
            scope: ['email', 'profile'],
        });

        if (!clientID || !clientSecret) {
            this.logger.warn('Google OAuth is NOT configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
        }
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<void> {
        const { id, name, emails, photos } = profile;

        const user = {
            googleId: id,
            email: emails?.[0]?.value,
            name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
            picture: photos?.[0]?.value,
        };

        done(null, user);
    }
}
