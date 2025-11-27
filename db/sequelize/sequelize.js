let { config, sequelize, connection } = require("./connection");
//--//
let models = {
    users: (require("./../schemas/users"))(connection, sequelize),
    banks: (require("./../schemas/banks"))(connection, sequelize),
    assets: (require("./../schemas/assets"))(connection, sequelize),
    assets_docs: (require("./../schemas/assets_docs"))(connection, sequelize),
    assets_audit: (require("./../schemas/assets_audit"))(connection, sequelize),
    users_otp: (require("./../schemas/users_otp"))(connection, sequelize),
    terminate_otp: (require("./../schemas/terminate_otp"))(connection, sequelize),
    support: (require("./../schemas/support"))(connection, sequelize),
    bank_managers: (require("./../schemas/bank_managers"))(connection, sequelize),
    assets_profits: (require("./../schemas/assets_profits"))(connection, sequelize),
    fund_profit: (require("./../schemas/fund_profit"))(connection, sequelize),
    authorizations: (require("./../schemas/authorizations"))(connection, sequelize),//
    //--//
    funds: (require("./../schemas/funds"))(connection, sequelize),
    funds_employers: (require("./../schemas/funds_employers"))(connection, sequelize),
    funds_assets: (require("./../schemas/funds_assets"))(connection, sequelize),
    funds_audit: (require("../schemas/funds_audit"))(connection, sequelize),
    funds_basic_details: (require("./../schemas/funds_basic_details"))(connection, sequelize),
    funds_fee_management: (require("./../schemas/funds_fee_management"))(connection, sequelize),
    funds_price_and_yield: (require("./../schemas/funds_price_and_yield"))(connection, sequelize),
    funds_general_write_up: (require("./../schemas/funds_general_write_up"))(connection, sequelize),
    funds_target_allocation: (require("./../schemas/funds_target_allocation"))(connection, sequelize),//
    //--//
    funds_groups: (require("./../schemas/funds_groups"))(connection, sequelize),
    funds_groups_funds: (require("./../schemas/funds_groups_funds"))(connection, sequelize),
    funds_groups_employees: (require("./../schemas/funds_groups_employees"))(connection, sequelize),//
    //--//
    employees_addresses: (require("./../schemas/employees_addresses"))(connection, sequelize),
    employees_disclaimer: (require("./../schemas/employees_disclaimer"))(connection, sequelize),
    employees_next_of_kin: (require("./../schemas/employees_next_of_kin"))(connection, sequelize),
    employees_identification: (require("./../schemas/employees_identification"))(connection, sequelize),
    employees_plan_specific_details: (require("./../schemas/employees_plan_specific_details"))(connection, sequelize),
    employees_tax_residency_information: (require("./../schemas/employees_tax_residency_information"))(connection, sequelize),//
    employees_vesting_logs: (require("./../schemas/employees_vesting_logs"))(connection, sequelize),//
    withdrawals_details: (require("./../schemas/withdrawals_details"))(connection, sequelize),//
    redemptions: (require("./../schemas/redemptions"))(connection, sequelize),//
    redemptions_withdrawals: (require("./../schemas/redemptions_withdrawals"))(connection, sequelize),//
    redemptions_subscriptions: (require("./../schemas/redemptions_subscriptions"))(connection, sequelize),//
    //--//
    employers: (require("./../schemas/employers"))(connection, sequelize),
    employers_admins: (require("./../schemas/employers_admins"))(connection, sequelize),
    employers_outlook: (require("./../schemas/employers_outlook"))(connection, sequelize),
    employers_managers: (require("./../schemas/employers_managers"))(connection, sequelize),
    employers_employees: (require("./../schemas/employers_employees"))(connection, sequelize),
    employers_employee_fund: (require("./../schemas/employers_employee_fund"))(connection, sequelize),
    employers_employer_fund: (require("./../schemas/employers_employer_fund"))(connection, sequelize),
    employers_addresses: (require("./../schemas/employers_addresses"))(connection, sequelize),
    employers_bank_details: (require("./../schemas/employers_bank_details"))(connection, sequelize),
    employers_ip_questions: (require("./../schemas/employers_ip_questions"))(connection, sequelize),
    employers_representatives: (require("./../schemas/employers_representatives"))(connection, sequelize),
    employers_general_write_up: (require("./../schemas/employers_general_write_up"))(connection, sequelize),
    employers_investment_adviser: (require("./../schemas/employers_investment_adviser"))(connection, sequelize),
    employers_documents_check_list: (require("./../schemas/employers_documents_check_list"))(connection, sequelize),
    employers_commercial_registration: (require("./../schemas/employers_commercial_registration"))(connection, sequelize),
    //--//
    withdrawals: (require("./../schemas/withdrawals"))(connection, sequelize),
    terminations: (require("./../schemas/terminations"))(connection, sequelize),
    transactions: (require("./../schemas/transactions"))(connection, sequelize),
    transactions_employer: (require("./../schemas/transactions_employer"))(connection, sequelize),
    contributions: (require("./../schemas/contributions"))(connection, sequelize),
    draft_contributions: (require("./../schemas/draft_contributions"))(connection, sequelize),
    draft_employees: (require("./../schemas/draft_employees"))(connection, sequelize),
    contributions_csv: (require("./../schemas/contributions_csv"))(connection, sequelize),
    contribution_receipet: (require("./../schemas/contribution_receipet"))(connection, sequelize),
    contributions_subscription: (require("./../schemas/contributions_subscription"))(connection, sequelize),
    withdrawals_subscription: (require("./../schemas/withdrawals_subscription"))(connection, sequelize),
    withdrawals_subscription_employer: (require("./../schemas/withdrawals_subscription_employer"))(connection, sequelize),
    re_allocations_requests: (require("./../schemas/re_allocations_requests"))(connection, sequelize),
    reallocation_withdrawal: (require("./../schemas/reallocation_withdrawal"))(connection, sequelize),
    reallocation_subscription: (require("./../schemas/reallocation_subscription"))(connection, sequelize),
    employers_employee_recommendation: (require("../schemas/employers_employee_recommendation"))(connection, sequelize),
    //--//
    lovs_naic: (require("./../schemas/lovs_naic"))(connection, sequelize),
    lovs_cities: (require("./../schemas/lovs_cities"))(connection, sequelize),
    lovs_countries: (require("./../schemas/lovs_countries"))(connection, sequelize),
    lovs_survey_questions: (require("../schemas/lovs_survey_questions"))(connection, sequelize),
    lovs_survey_question_answers: (require("../schemas/lovs_survey_question_answers"))(connection, sequelize),
    //--//
    push_sms: (require("../schemas/push_sms"))(connection, sequelize),
    app_logs: (require("../schemas/app_logs"))(connection, sequelize),
    app_versions: (require("../schemas/app_versions"))(connection, sequelize),
    request_logs: (require("../schemas/request_logs"))(connection, sequelize),
    push_notifications: (require("../schemas/push_notifications"))(connection, sequelize),
    terms: (require("../schemas/terms"))(connection, sequelize),
    group_matching: (require("../schemas/group_matching"))(connection, sequelize),
    employee_matching: (require("../schemas/employee_matching"))(connection, sequelize),

    lovs_course_categories: (require("./../schemas/lovs_course_categories"))(connection, sequelize),
    lovs_course_levels: (require("./../schemas/lovs_course_levels"))(connection, sequelize),
    courses: (require("./../schemas/courses"))(connection, sequelize),
    course_lessons: (require("./../schemas/course_lessons"))(connection, sequelize),
    course_user_likes: (require("./../schemas/course_user_likes"))(connection, sequelize),
    course_users: (require("./../schemas/course_users"))(connection, sequelize),
    course_user_lessons: (require("./../schemas/course_user_lessons"))(connection, sequelize),

    banks_funds: (require("./../schemas/banks_funds"))(connection, sequelize),
    partners: (require("./../schemas/partners"))(connection, sequelize),
    partner_managers: (require("./../schemas/partner_managers"))(connection, sequelize),
    portal_statuses: (require("./../schemas/portal_statuses"))(connection, sequelize),
    contributions_subscription_docs: (require("./../schemas/contributions_subscription_docs"))(connection, sequelize),

    onboardings: (require("./../schemas/onboardings"))(connection, sequelize),
    templates: (require("./../schemas/templates"))(connection, sequelize),
    template_funds: (require("./../schemas/template_funds"))(connection, sequelize),

    custodians: (require("./../schemas/custodians"))(connection, sequelize),
    accounts: (require("./../schemas/accounts"))(connection, sequelize),

    packages: (require("./../schemas/packages"))(connection, sequelize),
    employers_subscriptions: (require("./../schemas/employers_subscriptions"))(connection, sequelize),
    invoices: (require("./../schemas/employers_subscriptions_invoices"))(connection, sequelize),
    employers_employees_stats: (require("./../schemas/employers_employees_stats"))(connection, sequelize),
};
//--//
(require("./hooks"))(models);
(require("./scopes"))(models);
(require("./associations"))(models);
//--//
let instance = require("./instance");
module.exports = {
    config,
    sequelize,
    connection,
    models,
    db: instance
};
