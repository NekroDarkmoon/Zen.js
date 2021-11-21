import fs from 'fs';
import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, colorize, splat, timestamp, printf } = format;

export default function setupLogger(level) {
	const format = printf(({ level, message, timestamp, metadata }) => {
		let msg = `${timestamp} [${level}] : ${message}`;
		if (metadata) msg += JSON.stringify(metadata);

		return msg;
	});

	const logger = createLogger({
		level: level,
		format: combine(colorize(), splat(), timestamp(), format),
		transports: [
			new transports.Console({ level: level }),
			new transports.File({
				filename: './.logs/error.log',
				level: level,
			}),
		],
	});

	return logger;
}
