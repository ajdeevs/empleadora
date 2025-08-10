const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugMilestone() {
  try {
    console.log('🔍 Debugging milestone data...');
    
    const milestone = await prisma.milestone.findFirst({
      where: {
        projectId: 9,
        mid: 0
      },
      include: { project: true }
    });
    
    if (!milestone) {
      console.log('❌ Milestone not found');
      return;
    }
    
    console.log('📋 Milestone Data:');
    console.log('ID:', milestone.id);
    console.log('MID:', milestone.mid);
    console.log('Amount Wei:', milestone.amount_wei);
    console.log('Amount Wei Type:', typeof milestone.amount_wei);
    console.log('Funded:', milestone.funded);
    console.log('Released:', milestone.released);
    console.log('Project ID:', milestone.projectId);
    console.log('Onchain PID:', milestone.project.onchain_pid);
    console.log('Onchain PID Type:', typeof milestone.project.onchain_pid);
    
    // Test JSON serialization
    const testData = {
      milestoneId: milestone.mid,
      amount: milestone.amount_wei.toString(),
      funded: milestone.funded,
      released: milestone.released,
      projectId: milestone.projectId,
      onchainPid: milestone.project.onchain_pid.toString()
    };
    
    console.log('\n✅ JSON serialization test:');
    console.log(JSON.stringify(testData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugMilestone();
