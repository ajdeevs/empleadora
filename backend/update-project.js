const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProject() {
  try {
    console.log('🔄 Updating project in database...');
    
    // Update project ID 9 to use onchain_pid 0
    const updatedProject = await prisma.project.update({
      where: { id: 9 },
      data: { onchain_pid: 0n }
    });
    
    console.log('✅ Project updated successfully!');
    console.log('Project ID:', updatedProject.id);
    console.log('Onchain PID:', updatedProject.onchain_pid.toString());
    
    // Verify the project
    const project = await prisma.project.findUnique({
      where: { id: 9 },
      include: { milestones: true }
    });
    
    console.log('\n📋 Project Details:');
    console.log('ID:', project.id);
    console.log('Onchain PID:', project.onchain_pid.toString());
    console.log('Milestones:', project.milestones.length);
    
    project.milestones.forEach((milestone, index) => {
      console.log(`  Milestone ${index}:`, {
        id: milestone.id,
        mid: milestone.mid,
        amount: milestone.amount_wei,
        funded: milestone.funded,
        released: milestone.released
      });
    });
    
  } catch (error) {
    console.error('❌ Error updating project:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProject();
