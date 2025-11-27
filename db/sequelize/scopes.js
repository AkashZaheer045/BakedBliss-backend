const sequelize = require("sequelize");
module.exports = function (db) {
    db.users_otp.addScope("withoutOTP", { attributes: { exclude: ["otp"] } }, { override: true });
    db.users.addScope("withoutPassword", { attributes: { exclude: ["password"] } }, { override: true });
    db.users.addScope("withMinFields", { attributes: ["id", "name", "phone", "email", "survey"] }, { override: true });
    db.users.addScope("withSpecialFields", { attributes: ["id", "name", "phone", "email", "status", "active", "iqama_id", "iqama_expiry", "iqama_image", "role", "portal"] }, { override: true });
    db.authorizations.addScope("withoutPasswordToken", { attributes: { exclude: ["password_token"] } }, { override: true });
    db.banks.addScope("withMinFields", { attributes: ["id", "name", "phone", "email", "city", "country", "address", "manager_id"] }, { override: true });
    db.funds.addScope("withMinFields", { attributes: ["id", "name", "code", "currency", "risk_rating", "liquidity_risk", "management_fee", "subscription_fee", "performance_fee", "expected_yield_percentage", "expected_return_percentage", "bank_id"] }, { override: true });
    db.employers.addScope("withMinFields", { attributes: ["id", "company_id", "company_name", "type_of_activity", "industry_classification"] }, { override: true });
    db.assets.addScope("withMinFields", { attributes: ["id", "fund_id", "asset_name", "asset_code", "currency", "asset_owner", "nav_per_unit", "valuation_date", "risk_type", "rec_type", "liquidity_type", "class", "asset_class", "book_value", "current_value", "return_amount", "return_percentage"] }, { override: true });

    db.withdrawals.addScope("reportEmployeeFields", {
        attributes: ["id", "created_at", "employee_id",
            ["(SELECT IFNULL(ROUND(SUM(nav_per_unit * no_of_units), 2), 0.00) FROM `withdrawals_subscription` WHERE `withdrawals_id` = `withdrawals`.`id` )", "amount"]], where: { 'type': 'withdrawal' }
    }, { override: true });

    // db.withdrawals.addScope("reportEmployerFields", {attributes: ["id", "created_at", "employee_id", 
    // ["(SELECT IFNULL(ROUND(SUM(nav_per_unit * no_of_units), 2), 0.00) FROM `withdrawals_subscription` WHERE `withdrawals_id` = `withdrawals`.`id` )", "amount"]], where: {'type': 'terminate'}}, {override: true} );
    db.withdrawals.addScope("reportEmployerFields", {
        attributes: ["id", "created_at", "employee_id",
            ["(SELECT IFNULL(ROUND(SUM(nav_per_unit * no_of_units), 2), 0.00) FROM `withdrawals_subscription` WHERE `withdrawals_id` = `withdrawals`.`id` )", "amount"]]
    }, { override: true });

    db.contributions.addScope("reportEmployeeFields", { attributes: ["id", "created_at", "employee_id", ["employee_contribution_amount", "amount"]], where: { 'employee_contribution_amount': { [sequelize.Op.gt]: '0' } } }, { override: true });
    // db.contributions.addScope("reportEmployerFields", {attributes: ["id", "created_at", "employee_id", ["employer_contribution_amount", "amount"]], where: {'employer_contribution_amount': {[sequelize.Op.gt] : '0'}}}, {override: true});

    db.contributions.addScope("reportEmployerFields", { attributes: ["id", "created_at", "employee_id", [sequelize.literal("employee_contribution_amount + employer_contribution_amount"), "amount"]] }, { override: true });

    db.employees_vesting_logs.addScope("vestingArchive", { attributes: ["employee_id", "employer_id", "employee_name", "group_name", "author", "vested_amount", "vested_balance", "created_at"] })
};
