import { Logtail } from '@logtail/node';

// Test script to verify Logtail/Better Stack connection
async function testLogtail() {
  console.log('Testing Logtail/Better Stack connection...\n');

  const sourceToken = '8q3WwqFjeC1ghtTFJcgjhefz';
  const endpoint = 'https://s1641618.eu-nbg-2.betterstackdata.com';

  console.log(`Token: ${sourceToken.substring(0, 10)}...`);
  console.log(`Endpoint: ${endpoint}\n`);

  try {
    // Initialize Logtail
    const logtail = new Logtail(sourceToken, {
      endpoint: endpoint,
    });

    console.log('✅ Logtail initialized');

    // Send test log
    console.log('\nSending test log...');
    await logtail.info('Test log from manual script', {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'manual_test_script',
    });

    console.log('✅ Log sent (queued)');

    // Flush to ensure it's sent immediately
    console.log('\nFlushing logs to Better Stack...');
    await logtail.flush();

    console.log('✅ Logs flushed successfully!');
    console.log('\nCheck Better Stack dashboard:');
    console.log('https://telemetry.betterstack.com/team/t486268/tail?s=1641618');
    console.log('\nYou should see a log with message: "Test log from manual script"');
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogtail();
