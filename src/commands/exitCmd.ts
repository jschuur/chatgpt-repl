import { formatTotalUsage } from '../usage.js';
import { clearLine } from '../utils.js';

export default function exitCmd() {
  const totalUsage = formatTotalUsage();

  clearLine();
  console.log('See you next time! 🤖\n');
  console.log(totalUsage);

  process.exit(0);
}
