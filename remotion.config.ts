import { Config } from '@remotion/cli/config';
import { webpackOverride } from './src/remotion/webpack-override';

Config.overrideWebpackConfig(webpackOverride);
