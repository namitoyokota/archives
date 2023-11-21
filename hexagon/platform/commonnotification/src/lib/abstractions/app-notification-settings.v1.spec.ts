import test from 'ava';

import { AppNotificationSettings$v1 } from './app-notification-settings.v1';

test('App notification settings should have null properties', (t) => {
    // Arrange, Act
    const settings = new AppNotificationSettings$v1();

    // Assert
    t.is(settings.displayOrder, 0);
    t.is(settings.toastDuration, 15);
    t.is(settings.animation, true);
    t.is(settings.audio, false);
    t.is(settings.audioFile, null);
    t.is(settings.noGrouping, false);
});

test('App notification settings should have values', (t) => {
    // Arrange, Act
    const settings = new AppNotificationSettings$v1({
        displayOrder: 10,
        toastDuration: 100,
        animation: false,
        audio: true,
        audioFile: 'audioFile',
        noGrouping: true
    });

    // Assert
    t.is(settings.displayOrder, 10);
    t.is(settings.toastDuration, 100);
    t.is(settings.animation, false);
    t.is(settings.audio, true);
    t.is(settings.audioFile, 'audioFile');
    t.is(settings.noGrouping, true);
});
