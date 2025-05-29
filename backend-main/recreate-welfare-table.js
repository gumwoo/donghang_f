const sequelize = require('./src/config/database');
const WelfareBook = require('./src/models/WelfareBook');

async function recreateWelfareBookingTable() {
    try {
        console.log('🚀 데이터베이스 연결 중...');
        await sequelize.authenticate();
        console.log('✅ 데이터베이스 연결 성공!');

        console.log('🗑️ 기존 welfare_bookings 테이블 삭제 중...');
        await WelfareBook.drop({ cascade: true });
        console.log('✅ welfare_bookings 테이블 삭제 완료');

        console.log('🔨 welfare_bookings 테이블 재생성 중...');
        await WelfareBook.sync({ force: true });
        console.log('✅ welfare_bookings 테이블 재생성 완료');

        // 테이블 구조 확인
        const [columns] = await sequelize.query("DESCRIBE welfare_bookings");
        console.log('📋 새로 생성된 welfare_bookings 테이블 구조:');
        console.table(columns);

        console.log('🎉 테이블 재생성 완료!');

    } catch (error) {
        console.error('❌ 테이블 재생성 실패:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

recreateWelfareBookingTable();
