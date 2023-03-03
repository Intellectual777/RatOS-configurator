import * as trpc from '@trpc/server';
import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import { getScriptRoot } from '../../helpers/util';
import { getWirelessInterface, scan } from '../../helpers/iw';
import { hostnameInput, joinInput } from '../../helpers/validators/wifi';
import { getLogger } from '../../helpers/logger';
import { runSudoScript } from '../../helpers/run-script';

export const wifiRouter = trpc
	.router()
	.mutation('hostname', {
		input: hostnameInput,
		resolve: async ({ input }) => {
			const scriptRoot = getScriptRoot();
			try {
				const result = await promisify(exec)(`sudo ${path.join(scriptRoot, 'change-hostname.sh')} ${input.hostname}`);
			} catch (e) {
				if (e instanceof Error) {
					getLogger().error(e.message);
				}
				throw new trpc.TRPCError({
					message: 'An error occured while attempting to change the hostname',
					code: 'INTERNAL_SERVER_ERROR',
					cause: e,
				});
			}
			return {
				result: 'success',
			};
		},
	})
	.mutation('join', {
		input: joinInput,
		resolve: async ({ input }) => {
			try {
				await runSudoScript('add-wifi-network.sh', input.ssid, input.passphrase, input.country ?? 'GB');
			} catch (e) {
				if (e instanceof Error) {
					getLogger().error(e.message);
				}
				throw new trpc.TRPCError({
					message: 'Invalid wifi credentials',
					code: 'PRECONDITION_FAILED',
					cause: e,
				});
			}
			return {
				result: 'success',
			};
		},
	})
	.query('scan', {
		resolve: async () => {
			const wirelessInterface = await getWirelessInterface();
			if (wirelessInterface == null || wirelessInterface.trim() === '') {
				throw new trpc.TRPCError({
					message: "No wifi interface available on device, if you're connected via ethernet you can skip this step.",
					code: 'INTERNAL_SERVER_ERROR',
				});
			}
			try {
				// if (process.env.NODE_ENV === 'development') {
				// 	return [];
				// }
				return await scan(wirelessInterface, { apForce: true });
			} catch (e) {
				if (e instanceof Error) {
					getLogger().error(e.message);
				}
				throw new trpc.TRPCError({
					message: 'Failed to scan wifi networks',
					code: 'INTERNAL_SERVER_ERROR',
					cause: e,
				});
			}
		},
	});
