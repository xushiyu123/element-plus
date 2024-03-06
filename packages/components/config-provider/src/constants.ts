import type { ConfigProviderProps } from './config-provider-props'

export type ConfigProviderContext = Partial<ConfigProviderProps>

// 不同运行时之间共享
export const configProviderContextKey: any = 'CONFIG_PROVIDER_CONTEXT_KEY'
