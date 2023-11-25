import React, { useState, useEffect } from 'react';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import iconLocation from './location.svg';
import iconSunrise from './sunrise.svg';
import iconSunset from './sunset.svg';
import iconElapsed from './elapsed.svg';
import iconRemaining from './remaining.svg';

function Clock() {
    const [coords, setCoords] = useState(null);
    const [lastEvent, setLastEvent] = useState(null);
    const [nextEvent, setNextEvent] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);
    const [elapsedFormat, setElaFormat] = useState('t');
    const [remainingFormat, setRemFormat] = useState('t');

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        });
    }, []);

    useEffect(() => {
        if (coords) {
            const today = new Date();
            const yesterday = new Date(today);
            const tomorrow = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const sunriseToday = getSunrise(coords.latitude, coords.longitude);
            const sunsetToday = getSunset(coords.latitude, coords.longitude);
            const sunsetYesterday = getSunset(coords.latitude, coords.longitude, yesterday);
            const sunriseTomorrow = getSunrise(coords.latitude, coords.longitude, tomorrow);

            if (today > sunsetToday) {
                setLastEvent({ event: 'sunset', time: sunsetToday, icon: iconSunset });
            } else if (today > sunriseToday) {
                setLastEvent({ event: 'sunrise', time: sunriseToday, icon: iconSunrise });
            } else {
                setLastEvent({ event: 'sunset', time: sunsetYesterday, icon: iconSunset });
            }

            if (today < sunriseToday) {
                setNextEvent({ event: 'sunrise', time: sunriseToday, icon: iconSunrise });
            } else if (today < sunsetToday) {
                setNextEvent({ event: 'sunset', time: sunsetToday, icon: iconSunset });
            } else {
                setNextEvent({ event: 'sunrise', time: sunriseTomorrow, icon: iconSunrise });
            }
        }
    }, [coords]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (lastEvent) {
                setElapsedTime(Math.floor((new Date() - lastEvent.time) / 100));
            }
        }, 100);
        return () => clearInterval(interval);
    }, [lastEvent]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (nextEvent) {
                setRemainingTime(Math.floor((nextEvent.time - new Date()) / 100));
            }
        }, 100);
        return () => clearInterval(interval);
    }, [nextEvent]);

    const toggleElaFormat = () => {
        setElaFormat(elapsedFormat === 't' ? 'hms' : 't');
    };

    const toggleRemFormat = () => {
        setRemFormat(remainingFormat === 't' ? 'hms' : 't');
    };

    const formatElapsed = (time) => {
        if (elapsedFormat === 't') {
            return time;
        } else {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            return `${hours}:${minutes}:${seconds}`;
        }
    };

    const formatRemaining = (time) => {
        if (remainingFormat === 't') {
            return time;
        } else {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            return `${hours}:${minutes}:${seconds}`;
        }
    };

    return (
        <div>
            {coords ? (
                <>
                    <p className='row dark small'>
                        <img src={iconLocation} alt='location icon' className='icon-small' />
                        {coords.latitude} {coords.longitude}
                    </p>
                    {lastEvent ? (
                        <div>
                            <p className='row mid medium'>
                                <img src={lastEvent.icon} alt='last icon' className='icon-medium' />
                                last {lastEvent.event}
                            </p>
                            <p className='row white big'>
                                <img src={iconElapsed} alt='elapsed icon' className='icon-big' />
                                <div onClick={toggleElaFormat}>{formatElapsed(elapsedTime)}</div>
                            </p>
                        </div>
                    ) : (
                        'Getting last event...'
                    )}
                    {nextEvent ? (
                        <div>
                            <p className='row white big'>
                                <img src={iconRemaining} alt='remaining icon' className='icon-big' />
                                <div onClick={toggleRemFormat}>{formatRemaining(remainingTime)}</div>
                            </p>
                            <p className='row mid medium'>
                                <img src={nextEvent.icon} alt='next icon' className='icon-medium' />
                                next {nextEvent.event}
                            </p>
                        </div>
                    ) : (
                        'Getting next event...'
                    )}
                </>
            ) : (
                'Getting location...'
            )}
        </div>
    );
}

export default Clock;