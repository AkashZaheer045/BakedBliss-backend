const strings = require("./../utils/strings");
const keys_length = require("./../config/keys_length");
const server_config = require("./../config/server");
//--//
const moment = require('moment')
const PUSH = require("./../helpers/fcm_push");
const twillio = require("./../helpers/twillio");
const jwt = require("jsonwebtoken");
const sendMailTempAr = require("../helpers/send_mail_temp_ar");
const filter_ids = require("./../utils/filter_csv_ids");
const cronJob = require("../cron_jobs/asset_profit");
const fund_profit = require("../cron_jobs/fund_profit");
//--//
let dbInstance = require("./instance");
const { sequelize, connection } = require("./connection");
const Op = sequelize.Op;
//--//
const toLowerCase = function (str) {
    return String(str).toLowerCase();
};
const array_chunks = function (array, size) {
    let results = [];
    while (array.length) { results.push(array.splice(0, size)); }
    return results;
};
const uc_words = function (str) { return String(str).trim().toLowerCase().replace(/\b[a-z]/g, function (s) { return s.toUpperCase(); }); };
//--//
const employeeAccessRoles = ["employee"];
const fundManagerAccessRoles = ["fund-manager", "fund-maker", "fund-checker", "fund-portfolio-manager"];
const adminAccessRoles = ["admin", "tpl-maker", "tpl-checker", "tpl-viewer"];
const employerAccessRoles = ["employer", "emp-maker", "emp-checker", "emp-finance"];
//--//
const getUsersPushTokens = async function (type, db) {
    try {
        let condition = [];
        let condition1 = [];
        let findQuery = {
            where: {},
            attributes: ["user_id", "device_type", "device_token"],
            include: [{
                required: true,
                attributes: [],
                model: db.users,
                where: { active: "1", status: "1", is_push_notification_enabled: 1 }
            }],
            raw: true,
            nested: true
        };
        condition1.push({ device_type: { [Op.ne]: "" } });
        condition1.push({ device_type: { [Op.ne]: null } });
        condition1.push({ device_token: { [Op.ne]: "" } });
        condition1.push({ device_token: { [Op.ne]: null } });
        if (type && type === "admins") { condition.push({ role: adminAccessRoles }); }
        else if (type && type === "banks") { condition.push({ role: fundManagerAccessRoles }); }
        else if (type && type === "employers") { condition.push({ role: employerAccessRoles }); }
        else if (type && type === "employees") { condition.push({ role: employeeAccessRoles }); }
        //--//
        findQuery.include[0].where[Op.and] = condition;
        findQuery.where[Op.and] = condition1;
        const instance = new dbInstance(db.authorizations);
        return await instance.findAll(findQuery);
    }
    catch (error) { return [undefined, error]; }
};
const getUsersEmails = async function (user_ids, db) {
    let findQuery = {
        raw: true,
        nested: true,
        where: { id: user_ids },
        attributes: [[sequelize.literal("GROUP_CONCAT(DISTINCT `email`)"), "user_emails"]]
    };
    let uInstance = new dbInstance(db.users);
    let [user, uErr] = await uInstance.findOne(findQuery);
    if (uErr) { console.log("uErr", uErr); }
    return (user && user.user_emails) ? user.user_emails : "";
};
const getUsersDeviceTokens = async function (user_ids, db) {
    let findQuery = {
        raw: true,
        nested: true,
        where: { user_id: user_ids },
        attributes: [[sequelize.literal("GROUP_CONCAT(DISTINCT `device_token`)"), "device_tokens"]],
        order: [["id", "DESC"]]
    };
    let aInstance = new dbInstance(db.authorizations);
    let [auth, aErr] = await aInstance.findOne(findQuery);
    if (aErr) { console.log("aErr", aErr); }
    return (auth && auth.device_tokens) ? auth.device_tokens : "";
};
//--//
module.exports = function (db) {
    db.users.addHook("beforeSave", function (instance) {
        instance.email = toLowerCase(instance.email);
        // instance.phone = String(parseInt(instance.phone));
    });
    db.users.addHook("beforeCreate", function (instance) {
        instance.hashPassword();
        instance.hashConfirmPassword();
        if (adminAccessRoles.includes(instance.role)) { instance.portal = 'adminPortal' }
        if (fundManagerAccessRoles.includes(instance.role)) { instance.portal = 'fundManagerPortal' }
        if (employeeAccessRoles.includes(instance.role)) { instance.portal = 'employeePortal' }
        if (employerAccessRoles.includes(instance.role)) { instance.portal = 'employerPortal' }
    });

    db.users.addHook("beforeBulkCreate", function (instances) {
        instances.forEach((instance) => {
            instance.hashPassword();
            instance.hashConfirmPassword();
        });
    });

    db.users.addHook("beforeUpdate", function (instance) {
        if (instance.changed("password")) {
            instance.hashPassword();
            instance.hashConfirmPassword();
        }
    });
    db.funds_groups.addHook("afterUpdate", async function (instance) {
        if (instance.changed("is_default") && instance.is_default === "1") {
            let list;
            let eaErr;

            let findQuery = {
                where: { employer_id: instance.employer_id, id: { [Op.ne]: instance.id } },
                omitNull: false
            };
            let update_body = {
                is_default: "0",
                default_fund_id: null
            };
            let group_instance = db.funds_groups;
            [list, eaErr] = await group_instance.update(update_body, findQuery);
            if (eaErr) { console.log("eaErr", eaErr); } else { console.log('updated', list); }
        }
    });
    //--//
    db.users.addHook("afterCreate", function (instance) {
        (async (instance) => {
            // let email_body = "";
            let json = instance.toJSON();
            // if(json.role === "employee"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are just letting you know that a new employee was created for your organization. Please find the details below:<br><br>If this action seems suspicious to you, or you believe this is unauthorised, please let us know as soon as possible here.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable<br><br>Your ThriftPlan Team";}
            // if(json.role === "employer"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are just letting you know that a new user was created for your organization. Please find the details below:<br><br>If this action seems suspicious to you, or you believe this is unauthorised, please let us know as soon as possible here.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable<br><br>Your ThriftPlan Team";}
            // if(json.role === "fund-manager"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are just letting you know that a new user was created for your organization. Please find the details below.<br><br>If this action seems suspicious to you, or you believe this is unauthorised, please let us know as soon as possible here.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable.<br><br>Your ThriftPlan Team";}
            // if (json.role === "emp-maker" || json.role === "emp-checker") { email_body = "Dear " + uc_words(json.name) + "!<br><br>Welcome to the team! <br><br>To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.<br><br>We are so happy to see you helping us bring Social Security to the people of the GCC, it’s a difficult journey, but with your help… We can do that! <br><br>We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! <br><br>Thank you for being part of the journey!<br><br>Your ThriftPlan Team"; }
            // if (json.role === "tpl-maker" || json.role === "tpl-checker") { email_body = "Dear " + uc_words(json.name) + "!<br><br>Welcome to the team! <br><br>To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.<br><br>We are so happy to see you helping us bring Social Security to the people of the GCC, it’s a difficult journey, but with your help… We can do that! <br><br>We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! <br><br>Thank you for being part of the journey!<br><br>Your ThriftPlan Team"; }
            //--//
            //--//
            let email_text = "";
            if (json.role === "emp-maker" || json.role === "emp-checker") {
                email_text = `Welcome to the team! 
                To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.
                We are so happy to see you helping us bring Social Security to the people of the GCC, it’s a difficult journey, but with your help… We can do that! 
                We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! 
                Thank you for being part of the journey!`;
                let email_text_ar = `مرحبًا بك في فريق ثرفت بلان
                <br><br> لإنهاء إعداد حسابك، يرجى تسجيل الدخول باستخدام بيانات الاعتماد التالية ، والرجاء التأكد من تغييرها بمجرد تسجيل الدخول.
                <br><br> نحن متحمسون لرؤيتك تساعدنا في رحله تغيير مفهوم التأمينات الاجتماعية  في منطقة الشرق الأوسط وشمال إفريقيا ، الطريق طويل  لتحقيق هذا الهدف ولكن بمساعدتك يمكننا تحقيقه 
                <br><br> نوصيك بتوخي الحذر بشأن المعلومات التي تشاركتها مع العملاء أو المستخدمين الآخرين ، فجميع البيانات الموجودة على البوابة سرية ومن واجبك تجاه العميل أن تكون أمين عليها
                <br><br> شكرا لكونك جزء من رحلة التغيير
                <br><br> فريق ثرفت بلان`;
                if (json.email !== "" && email_text !== "") { sendMailTempAr(json.email, "ThriftPlan Account Created", uc_words(json.name), null, email_text, email_text_ar); }
            }

            // if (json.role === "tpl-maker" || json.role === "tpl-checker") { email_text = `Welcome to the team! 
            // To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.
            // We are so happy to see you helping us bring Social Security to the people of the GCC, it’s a difficult journey, but with your help… We can do that! 
            // We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! 
            // Thank you for being part of the journey!`; }
            if (json.role === "tpl-maker" || json.role === "tpl-checker") {
                email_text = `Welcome to the team! <br><br> To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.
                <br><br> We are excited to see you helping us transform Social Security for the people of the MENA, it’s a difficult journey, but with your help… We can do that! 
                <br><br> We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! 
                <br><br> Thank you for being part of the journey!
                <br><br> Your ThriftPlan Team`;
                let email_text_ar = `مرحبًا بك في فريق ثرفت بلان
                <br><br> لإنهاء إعداد حسابك، يرجى تسجيل الدخول باستخدام بيانات الاعتماد التالية ، والرجاء التأكد من تغييرها بمجرد تسجيل الدخول.
                <br><br> نحن متحمسون لرؤيتك تساعدنا في رحله تغيير مفهوم التأمينات الاجتماعية  في منطقة الشرق الأوسط وشمال إفريقيا ، الطريق طويل  لتحقيق هذا الهدف ولكن بمساعدتك يمكننا تحقيقه 
                <br><br> نوصيك بتوخي الحذر بشأن المعلومات التي تشاركتها مع العملاء أو المستخدمين الآخرين ، فجميع البيانات الموجودة على البوابة سرية ومن واجبك تجاه العميل أن تكون أمين عليها
                <br><br> شكرا لكونك جزء من رحلة التغيير
                <br><br> فريق ثرفت بلان`;
                if (json.email !== "" && email_text !== "") { sendMailTempAr(json.email, "ThriftPlan Account Created", uc_words(json.name), null, email_text, email_text_ar); }
            }

            if (json.role === "fund-manager" || json.role === "fund-maker" || json.role === "fund-checker") {
                email_text = `Welcome to the team! <br><br> To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.
                <br><br> We are excited to see you helping us transform Social Security for the people of the MENA, it’s a difficult journey, but with your help… We can do that! 
                <br><br> We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! 
                <br><br> Thank you for being part of the journey!
                <br><br> Your ThriftPlan Team`;
                let email_text_ar = `مرحبًا بك في فريق ثرفت بلان
                <br><br> لإنهاء إعداد حسابك، يرجى تسجيل الدخول باستخدام بيانات الاعتماد التالية ، والرجاء التأكد من تغييرها بمجرد تسجيل الدخول.
                <br><br> نحن متحمسون لرؤيتك تساعدنا في رحله تغيير مفهوم التأمينات الاجتماعية  في منطقة الشرق الأوسط وشمال إفريقيا ، الطريق طويل  لتحقيق هذا الهدف ولكن بمساعدتك يمكننا تحقيقه 
                <br><br> نوصيك بتوخي الحذر بشأن المعلومات التي تشاركتها مع العملاء أو المستخدمين الآخرين ، فجميع البيانات الموجودة على البوابة سرية ومن واجبك تجاه العميل أن تكون أمين عليها
                <br><br> شكرا لكونك جزء من رحلة التغيير
                <br><br> فريق ثرفت بلان`;
                if (json.email !== "" && email_text !== "") { sendMailTempAr(json.email, "ThriftPlan Account Created", uc_words(json.name), null, email_text, email_text_ar); }
            }
            //--//
            // if (json.role === "employer") { email_text = `Welcome to the team! 
            // To finish setting up your account, please sign in using the following credentials, make sure to change them as soon as you signed in.
            // EMAIL: ${instance.email} PASSWORD: 123123
            // We are so happy to see you helping us bring Social Security to the people of the GCC, it’s a difficult journey, but with your help… We can do that! 
            // We strongly urge you to be careful with the communication shared to clients or other users, all data found on the portal is confidential and it is your duty to the client to guard it! 
            // Thank you for being part of the journey!`; }
            //--//
            // if (json.email !== "" && email_body !== "") { sendMail(json.email, "ThriftPlan Account Created", email_body); }
        })(instance);
    });
    db.users.addHook("afterUpdate", function (instance) {
        (async (instance) => {
            let email_text = "";
            let json = instance.toJSON();
            // if(instance.role === "employer"){
            //     if(instance.changed("active") || instance.changed("status") || instance.changed("is_under_review")){
            //         if(String(instance.active) === "0" || String(instance.status) === "0" || String(instance.is_under_review) === "1"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are terribly sorry to see you leave, it was a pleasure helping you save a little bit more and hope you were able to feel a little more financial security while using ThriftPlan.<br><br>We are constantly improving our network and services and hope to see you again soon.<br><br>If yu left your employer and your new employer isn’t part of our network yet, feel free to recommend us to your employer or drop our networking team a message here, if you want us to reach out; and we will try to help you get back into Saving.<br><br>In the meantime, thank you for trusting in ThriftPlan and bringing a little bit more Social Security to KSA!<br><br>Your ThriftPlan Team";}
            //     }
            // }
            if (instance.role === "employee") {
                if (instance.changed("active") || instance.changed("status") || instance.changed("is_under_review")) {
                    if (String(instance.changed("status")) === "1") {
                        // if (String(instance.active) === "0" || String(instance.status) === "0" || String(instance.is_under_review) === "1") { 
                        // email_body = "Dear " + uc_words(json.name) + "!<br><br>Congratulations, you have been validated and approved by your employer to participate in this Social Security incentive.<br><br>Thriftplan is an employer sponsored saving plan, where your employer pays you to save! Best of all we do all the hard work for you and all that is left for you to set us your account is to follow the link below and confirm the details registered by your employer. <br><br>Please feel free to contact customer support here, if you have any questions or need support.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team"; 
                        //                         email_text = `Congratulations, you have been validated and approved by your employer to participate in this Social Security incentive.
                        //                         Thriftplan is an employer sponsored saving plan, where your employer pays you to save! Best of all we do all the hard work for you and all that is left for you to set us your account is to follow the link below and confirm the details registered by your employer. 
                        //                         Please feel free to contact customer support here, if you have any questions or need support.`; 

                        //                         email_text += `<br/><br/><br/>
                        //                         مرحباً ${uc_words(json.name)}
                        // تهانينا ، لقد تمت الموافقة و التصديق على حسابك من قبل جهة العمل الخاصة بك للمشاركة في حافز الضمان الاجتماعي هذا. ثرفت بلان هي خطة ادخار تقدم لك بالنتعاون مع جهة العمل ، حيث يدفع لك صاحب العمل لتوفر! أفضل ما في الأمر أننا نقوم بكل العمل الشاق من أجلك ، وكل ما تبقى لك لتعيين حسابك هو اتباع الرابط أدناه وتأكيد التفاصيل المسجلة من قبل جهة العمل الخاصة بك. لا تتردد في الاتصال بخدمة العملاء، إذا كان لديك أي أسئلة أو كنت بحاجة إلى دعم.
                        // شكرًا لك على ثقتك في ثرفت بلان ، نحن نعمل بجد لجعل كل تجربة معنا لا تُنسى. مرحبًا بكم في مستقبل الضمان الاجتماعي!
                        // فريق ثرفت بلان.
                        // يرجى ملاحظة أن ثرفت بلان تأخذ أمان حسابك على محمل الجد ، لذلك نطلب منك عدم مشاركة كلمة المرور لمرة واحدة مع أي شخص. لن يطلب منك فريق الأمان لدينا أبدًا الكشف أو التحقق من كلمة المرور أو كلمة المرور لمرة واحدة أو تفاصيل بطاقة الائتمان الخاصة بك. إذا لم تكن قد طلبت كلمة المرور لمرة واحدة أو تلقيت أي بريد إلكتروني مشبوه يطلب منك تفاصيل حساسة ، فالرجاء عدم النقر فوق أي روابط أو متابعة الطلبات ولكن بدلاً من ذلك قم بإعادة توجيه البريد الإلكتروني إلى فريق التحقيق لدينا على : tech@thriftplan.sa
                        //                         `;

                        let email_text = `Congratulations, you have been validated and approved by your employer to participate in this Social Security incentive.
                    Thriftplan is an employer sponsored saving plan, where your employer pays you to save! Best of all we do all the hard work for you and all that is left for you to set us your account is to follow the link below and confirm the details registered by your employer. 
                    Please feel free to contact customer support here, if you have any questions or need support.`;
                        let email_text_ar = `تهانينا ، لقد تمت الموافقة و التصديق على حسابك من قبل جهة العمل الخاصة بك للمشاركة في حافز الضمان الاجتماعي هذا. ثرفت بلان هي خطة ادخار تقدم لك بالنتعاون مع جهة العمل ، حيث يدفع لك صاحب العمل لتوفر! أفضل ما في الأمر أننا نقوم بكل العمل الشاق من أجلك ، وكل ما تبقى لك لتعيين حسابك هو اتباع الرابط أدناه وتأكيد التفاصيل المسجلة من قبل جهة العمل الخاصة بك. لا تتردد في الاتصال بخدمة العملاء، إذا كان لديك أي أسئلة أو كنت بحاجة إلى دعم.
                    شكرًا لك على ثقتك في ثرفت بلان ، نحن نعمل بجد لجعل كل تجربة معنا لا تُنسى. مرحبًا بكم في مستقبل الضمان الاجتماعي!
                    فريق ثرفت بلان.
                    يرجى ملاحظة أن ثرفت بلان تأخذ أمان حسابك على محمل الجد ، لذلك نطلب منك عدم مشاركة كلمة المرور لمرة واحدة مع أي شخص. لن يطلب منك فريق الأمان لدينا أبدًا الكشف أو التحقق من كلمة المرور أو كلمة المرور لمرة واحدة أو تفاصيل بطاقة الائتمان الخاصة بك. إذا لم تكن قد طلبت كلمة المرور لمرة واحدة أو تلقيت أي بريد إلكتروني مشبوه يطلب منك تفاصيل حساسة ، فالرجاء عدم النقر فوق أي روابط أو متابعة الطلبات ولكن بدلاً من ذلك قم بإعادة توجيه البريد الإلكتروني إلى فريق التحقيق لدينا على : tech@thriftplan.sa
                                        `
                        // sendMailTempAr(json.email, "ThriftPlan Account Status", uc_words("Dear " + json.name), null, email_text, email_text_ar);
                    }
                    // else if(active === "0" || status === "0" || is_under_review === "1"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are terribly sorry to see you leave, it was a pleasure helping you save a little bit more and hope you were able to feel a little more financial security while using ThriftPlan.<br><br>We are constantly improving our network and services and hope to see you again soon.<br><br>If yu left your employer and your new employer isn’t part of our network yet, feel free to recommend us to your employer or drop our networking team a message here, if you want us to reach out; and we will try to help you get back into Saving.<br><br>In the meantime, thank you for trusting in ThriftPlan and bringing a little bit more Social Security to KSA!<br><br>Your ThriftPlan Team";}
                    // else if(is_under_review === "2"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are terribly sorry to see you leave, it was a pleasure helping you save a little bit more and hope you were able to feel a little more financial security while using ThriftPlan.<br><br>We are constantly improving our network and services and hope to see you again soon.<br><br>If yu left your employer and your new employer isn’t part of our network yet, feel free to recommend us to your employer or drop our networking team a message here, if you want us to reach out; and we will try to help you get back into Saving.<br><br>In the meantime, thank you for trusting in ThriftPlan and bringing a little bit more Social Security to KSA!<br><br>Your ThriftPlan Team";}
                }
            }
            // else{
            //     if(instance.changed("active") || instance.changed("status") || instance.changed("is_under_review")){
            //         if(String(instance.active) === "0" || String(instance.status) === "0" || String(instance.is_under_review) === "1"){email_body = "Dear " + uc_words(json.name) + "!<br><br>We are terribly sorry to see you leave, it was a pleasure helping you save a little bit more and hope you were able to feel a little more financial security while using ThriftPlan.<br><br>We are constantly improving our network and services and hope to see you again soon.<br><br>If yu left your employer and your new employer isn’t part of our network yet, feel free to recommend us to your employer or drop our networking team a message here, if you want us to reach out; and we will try to help you get back into Saving.<br><br>In the meantime, thank you for trusting in ThriftPlan and bringing a little bit more Social Security to KSA!<br><br>Your ThriftPlan Team";}
            //         if(String(instance.active) === "1" && String(instance.status) === "1" && String(instance.is_under_review) === "0"){email_body = "Dear " + uc_words(json.name) + "!<br><br>Your Account was approved by the Validator account. <br><br>All the best, <br><br>Your ThriftPlan Team";}
            //     }
            // }
            //--//

        })(instance);
    });
    //--//
    db.employers.addHook("afterUpdate", function (instance) {
        (async (instance) => {
            let admin;
            let eaErr;
            let admins_instance = new dbInstance(db.users);
            let findQuery = {
                where: { role: "employer" },
                attributes: [`id`, `name`, `phone`, `email`, `role`, `status`, `active`, `is_under_review`],
                include: [
                    {
                        require: true,
                        attributes: [],
                        model: db.employers_admins,
                        where: { employer_id: instance.id }
                    }
                ]
            };
            [admin, eaErr] = await admins_instance.findOne(findQuery);
            if (eaErr) { console.log("eaErr", eaErr); }
            if (admin) {
                let update_body = {
                    status: instance.status,
                    active: instance.active,
                    is_under_review: instance.is_under_review
                };
                admins_instance.model = admin;
                [admin, eaErr] = await admins_instance.update(update_body);
                if (eaErr) { console.log("eaErr", eaErr); }
            }
        })(instance);
    });
    //--//
    db.withdrawals.addHook("beforeSave", function (instance) {
        if (instance.bank_status === "1" && instance.employer_status === "1") { instance.status = "1"; }
        if (instance.bank_status === "2" || instance.employer_status === "2") { instance.status = "2"; }
        if (instance.bank_status === "3" && instance.employer_status === "1") { instance.status = "3"; }
    });
    // db.withdrawals.addHook("afterUpdate", function (instance) {
    //     (async (instance) => {
    //         if (instance.changed("bank_status") && String(instance.bank_status) === "1") {
    //             let users_instance = new dbInstance(db.users);
    //             let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
    //             let [user, uErr] = await users_instance.findByPk(employee_id);
    //             if (uErr) { console.log("uErr", uErr); }
    //             if (user && user.id) {
    //                 // let email_body = "Dear " + uc_words(user.name) + "!<br><br>Your request to withdraw from your account has been approved. <br><br>The withdrawal will now be prepared to be transferred to your employer who will be responsible to distribute the amount to you.<br><br>Please feel free to check our T&Cs for more details as to when and how withdrawals are processed or feel free to contact our customer support here, for any questions of queries you may have.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
    //                 let email_text = `Your request to withdraw of SAR ${instance.amount} from your account has been approved. 
    //                 The withdrawal will now be prepared to be transferred to your employer who will be responsible to distribute the amount to you.
    //                 Please feel free to check our T&Cs for more details as to when and how withdrawals are processed or feel free to contact our customer support here, for any questions of queries you may have.`;
    //                 // sendMail(user.email, "Withdrawals Request Approved", email_body);
    //                 let email_text_ar = `"
    //                 عزيزنـ/تـنا /// الاسم الأول للموظف ///

    //                 تمت الموافقة على طلبك لسحب من حسابك. سيتم الآن تحويله إلى صاحب العمل الذي سيكون مسؤولاً عن تحويل المبلغ لك.

    //                 لا تتردد في الاتصال بدعم العملاء على wecare@thriftplan.io ، لأية استفسارات لديك.

    //                 فريق ثرفت بلان
    //                 "`
    //                 sendMailTempAr(user.email, "Withdrawals Request Approved", uc_words(user.name), null, email_text, email_text_ar);
    //             }
    //         }
    //     })(instance);
    // });
    // db.withdrawals.addHook("afterCreate", function (instance) {
    //     (async (instance) => {
    //         // if (instance.changed("status") && String(instance.status) === "1") {
    //         let users_instance = new dbInstance(db.users);
    //         let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
    //         let [employee, uErr] = await users_instance.findByPk(employee_id);
    //         if (uErr) { console.log("uErr", uErr); }
    //         if (employee && employee.id && instance.type != 'terminate') {
    //             // let email_body = "Dear " + uc_words(employee.name) + "!<br><br>Your account was credited with a new contribution. Please sign into your account to see how this effected your savings.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
    //             let email_text = `You have requested a withdrawal of SAR ${instance.amount} for your account . 
    //                 We are currently processing this request and will let you know as soon as it has been processed.
    //                 Please note, this is not a confirmation, should you have any questions of queries you can contact our customer support at wecare@thriftplan.io. 
    //                 Your ThriftPlan Team`;
    //             // sendMail(employee.email, "Contribution Request Appro//last 4 digits//.ved", email_body);
    //             let email_text_ar = `"
    //                 "لقد طلبت سحب ${instance.amount} ريال سعودي لحسابك.

    //                 نقوم حاليا بمعالجة هذا الطلب وسنعلمك بمجرد معالجته.

    //                 يرجى ملاحظة أن هذا ليس تأكيدا. إذا كان لديك أي أسئلة يمكنك الاتصال بخدمة دعم العملاء لدينا على wecare@thriftplan.io.

    //                 فريق ثرفت بلان الخاص بك
    //                 "`
    //             sendMailTempAr(employee.email, "Withdrawal Request Created", uc_words("Dear " + employee.name), null, email_text, email_text_ar);
    //         }
    //         // }
    //     })(instance);
    // });
    //--//
    db.contributions.addHook("beforeSave", function (instance) {
        if (instance.bank_status === "1") { instance.status = "1"; }
        if (instance.bank_status === "2") { instance.status = "2"; }
        if (instance.bank_status === "3") { instance.status = "3"; }
        // if (instance.employer_status === "2") { instance.status = "2"; }
        //--//
        instance.vested_amount_percent = parseFloat(instance.vested_amount_percent || 0.000) || 0.000;
        instance.employee_contribution_amount = parseFloat(instance.employee_contribution_amount || 0.00) || 0.00;
        instance.employer_contribution_amount = parseFloat(instance.employer_contribution_amount || 0.00) || 0.00;
        //--//
        instance.un_vested_amount_percent = parseFloat(100 - instance.vested_amount_percent);
        instance.vested_amount = ((instance.employer_contribution_amount * instance.vested_amount_percent) / 100);
        instance.un_vested_amount = (instance.employer_contribution_amount - instance.vested_amount);
    });
    db.contributions.addHook("afterUpdate", function (instance) {
        (async (instance) => {
            if (instance.changed("status") && String(instance.status) === "1") {
                let users_instance = new dbInstance(db.users);
                let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
                let [user, uErr] = await users_instance.findByPk(employee_id);
                if (uErr) { console.log("uErr", uErr); }
                if (user && user.id) {
                    const title = "Contribution Processed";
                    const amount = instance.employee_contribution_amount.toLocaleString('en-US', { style: 'currency', currency: 'SAR', });
                    const message = `Your contribution of ${amount} has been successfully processed.`;
                    let email_text = message;
                    let email_text_ar = `لقد تمت معالجة
مساهمتك بمبلغ
${amount} لاير سعودي
بنجاح`
                    sendMailTempAr(user.email, title, uc_words(user.name), null, email_text, email_text_ar);

                    const pnData = {
                        portal_id: 'employeePortal',
                        send_to: 'employees',
                        from_id: employee_id,
                        to_ids: employee_id,
                        read_ids: '',
                        title,
                        message,
                        send_push: '0',

                        label_tag: title,
                        message_log: message,
                        action_id: instance.id,
                        other_id: employee_id,
                        employer_id: instance.employer_id,
                    }
                    let pnInstance = new dbInstance(db.push_notifications);
                    let [pnCreated, pnErr] = await pnInstance.create(pnData);
                    if (pnErr) { console.error('pnErr', pnErr); }

                    let alInstance = new dbInstance(db.app_logs);
                    let [alCreated, alErr] = await alInstance.create(pnData);
                    if (alErr) { console.error('alErr', alErr); }
                }
            }
        })(instance);
    });
    // db.contributions.addHook("afterCreate", function (instance) {
    //     (async (instance) => {
    //         // if (instance.changed("status") && String(instance.status) === "1") {
    //         let users_instance = new dbInstance(db.users);
    //         let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
    //         let [employee, uErr] = await users_instance.findByPk(employee_id);
    //         if (uErr) { console.log("uErr", uErr); }
    //         if (employee && employee.id) {
    //             // let email_body = "Dear " + uc_words(employee.name) + "!<br><br>Your account was credited with a new contribution. Please sign into your account to see how this effected your savings.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
    //             let email_text = `We are just letting you know that you submitted a contribution, this is not a confirmation of receipt!
    //                 Once your fund manager has received the funds, you will be notified.
    //                 Your ThriftPlan Team`;
    //             // sendMail(employee.email, "Contribution Request Created", email_body);
    //             let email_text_ar = `"
    //                 نحن فقط نعلمك أنك قدمت مساهمة. هذا ليس تأكيدا للاستلام.

    //                 بمجرد استلام مدير الصندوق الخاص بك للأموال، سيتم إعلامكم.

    //                 فريق ثرفت بلان الخاص بك
    //                "`
    //             sendMailTempAr(employee.email, "Contribution Request Created", uc_words("Dear " + employee.name), null, email_text, email_text_ar);
    //         }
    //         // }
    //     })(instance);
    // });
    //--//
    db.contributions_csv.addHook("beforeSave", function (instance) {
        if (instance.bank_status === "1") { instance.status = "1"; }
        if (instance.bank_status === "2") { instance.status = "2"; }
        if (instance.bank_status === "3") { instance.status = "3"; }
        // if (instance.employer_status === "2") { instance.status = "2"; }
        //--//
    });
    db.contributions_csv.addHook("afterCreate", function (instance) {
        (async (instance) => {
            // if (instance.changed("status") && String(instance.status) === "1") {
            let users_instance = new dbInstance(db.users);
            let employer_id = parseInt(String(instance.employer_id) || 0) || 0;
            let query_01 = "SELECT GROUP_CONCAT(DISTINCT `users`.`id` ORDER BY `users`.`id`) AS `ids` FROM `users` INNER JOIN `employers_admins` ON `employers_admins`.`admin_id` = `users`.`id` AND `employers_admins`.`deleted_at` IS NULL WHERE `role` IN ('employer') AND `users`.`active` = '1' AND `users`.`deleted_at` IS NULL AND `employers_admins`.`employer_id` = " + employer_id + "";
            let [empAdmin, r1Err] = await connection.query(query_01);
            if (r1Err) console.log(r1Err);
            let [employer, uEErr] = await users_instance.findByPk(empAdmin[0].ids);
            if (uEErr) { console.log("uEErr", uEErr); }
            if (employer && employer.id && employer.email) {
                let email_text = `We are just letting you know that you submitted a contribution, this is not a confirmation of receipt!
                    Once your fund manager has received the funds, you will be notified.
                    Your ThriftPlan Team`;
                // sendMailTempAr(employer.email, "Contribution Request Created", uc_words(employer.name), null, email_text, email_text);
            }
            // }
        })(instance);
    });
    //--//
    db.re_allocations_requests.addHook("beforeSave", function (instance) {
        if (instance.bank_status === "1" && instance.admin_status === "1") { instance.status = "1"; }
        if (instance.bank_status === "2" || instance.admin_status === "2") { instance.status = "2"; }
        if (instance.bank_status === "3" || instance.admin_status === "3") { instance.status = "3"; }
    });
    db.re_allocations_requests.addHook("afterSave", async function (instance) {
        if (instance.changed("status") && instance.status === "1") {
            let fund_id = instance.fund_id;
            let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
            let _instance = new dbInstance(db.employers_employee_fund);
            let condition = { fund_id: fund_id, employee_id: employee_id };
            let [archived, err1] = await _instance.destroy({ where: { employee_id: employee_id } });
            let fundBody = { fund_id: fund_id, employee_id: employee_id, filled_as: "manual" };
            let [employee_fund, err2] = await _instance.create(fundBody);
            //--//
            let users_instance = new dbInstance(db.users);
            let [user, uErr] = await users_instance.findByPk(employee_id);
            if (uErr) { console.log("uErr", uErr); }
            if (user && user.id) {
                // let email_body = "Dear " + uc_words(user.name) + "!<br><br>Your have made a change in the risk tolerance setting, which means that your funds will now be allocated to another fund.<br><br>This will not come into effect immediately, but in the next quarter. We are fully committed to providing you with the highest degree of transparency, so please feel free to contact us here, if you are unsure about why your funds are being reallocated, you can also check out our T&Cs here to find more details about fund allocations. <br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
                let email_text = `Your have made a change in the risk tolerance setting, which means that your funds will now be allocated to another fund.
                This will not come into effect immediately, but in the next quarter. We are fully committed to providing you with the highest degree of transparency, so please feel free to contact us here, if you are unsure about why your funds are being reallocated, you can also check out our T&Cs here to find more details about fund allocations.`;
                // sendMail(user.email, "Re-Allocations Request Approved", email_body);
                let email_text_ar = `"
                عزيزنـ/تـنا /// الاسم الأول للموظف ///
                
                لقد قمت بإجراء تغيير في إعدادت تحمل المخاطر لمحفظتك الاستثمارية، مما يعني أنه سيتم الآن تخصيص أموالك لمحفظة أخرى.
                
                يعمل مدير الصندوق الخاص بك على إعادة تنظيم محافظك الاستثمارية وسيتم إبلاغك بمجرد اكتمال هذه العملية ، 
                
                تعرف على المزيد حول الاستثمارات والمحافظ على موقعنا هنا.
                
                لا تتردد في الاتصال بدعم العملاء على wecare@thriftplan.io ، لأية استفسارات لديك.
                
                فريق ثرفت بلان
                "`
                // sendMailTempAr(user.email, "Re-Allocations Request Approved", uc_words(user.name), null, email_text, email_text_ar);
            }
            //--//
            // let ids = [];
            // _instance = new dbInstance(db.contributions);
            // let findQuery = {
            //     raw: true,
            //     nested: true,
            //     where: { employee_id: employee_id },
            //     attributes: [[sequelize.literal("GROUP_CONCAT(`id`)"), "ids"]]
            // };
            // let [data, iErr] = await _instance.findOne(findQuery);
            // if (iErr) { console.log("iErr", iErr); }
            // if (data) { ids = filter_ids(data.ids); }
            // if (ids && ids.length > 0) {
            //     //--//
            //     let query_01 = "INSERT INTO `contributions` (`vested_amount`,`un_vested_amount`,`vested_amount_percent`,`un_vested_amount_percent`,`employee_contribution_amount`,`employer_contribution_amount`,`employee_fund_id`,`employer_fund_id`,`employee_id`,`employer_id`,`notes`,`bank_notes`,`status`,`bank_status`,`active`,`created_at`,`updated_at`,`deleted_at`) SELECT `vested_amount`,`un_vested_amount`,`vested_amount_percent`,`un_vested_amount_percent`,`employee_contribution_amount`,`employer_contribution_amount`,`employee_fund_id`,`employer_fund_id`,`employee_id`,`employer_id`,`notes`,`bank_notes`,`status`,`bank_status`,`active`,`created_at`,`updated_at`, NOW() FROM `contributions` WHERE `id` IN(" + ids.join(",") + ")";
            //     let query_02 = "UPDATE `contributions` SET `employee_fund_id` = '" + fund_id + "' WHERE `id` IN(" + ids.join(",") + ")";
            //     let [result_01, r1Err] = await connection.query(query_01, { raw: true, type: sequelize.QueryTypes.INSERT });
            //     let [result_02, r2Err] = await connection.query(query_02, { raw: true, type: sequelize.QueryTypes.UPDATE });
            // }
            //--//
        }
    });
    db.re_allocations_requests.addHook("afterCreate", function (instance) {
        (async (instance) => {
            // if (instance.changed("status") && String(instance.status) === "1") {
            let users_instance = new dbInstance(db.users);
            let employee_id = parseInt(String(instance.employee_id) || 0) || 0;
            let [employee, uErr] = await users_instance.findByPk(employee_id);
            if (uErr) { console.log("uErr", uErr); }
            if (employee && employee.id) {
                // let email_body = "Dear " + uc_words(employee.name) + "!<br><br>Your account was credited with a new contribution. Please sign into your account to see how this effected your savings.<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
                let email_text = `You have requested a reallocation of for your fund. 
                    We are currently processing this request and will let you know as soon as it has been processed.
                    Please note, this is not a confirmation, should you have any questions of queries you can contact our customer support at wecare@thriftplan.io. 
                    Your ThriftPlan Team`;
                // sendMail(employee.email, "Contribution Request Appro//last 4 digits//.ved", email_body);
                // sendMailTempAr(employee.email, "Reallocation Request Created", uc_words(employee.name), null, email_text, email_text);
            }
            // }
        })(instance);
    });
    //--//
    db.users_otp.addHook("beforeCreate", function (instance) {
        if (!instance.otp || instance.otp === "" || instance.otp.length !== keys_length.otp) {
            if (server_config.host == server_config.hosts.production || server_config.host == server_config.hosts.pre_production) {
                instance.otp = strings.generateRandomOtp(keys_length.otp);
            } else {
                instance.otp = "010101";
            }
        }
    });
    // db.users_otp.addHook("afterCreate", function (instance) {
    //     (async (instance) => {
    //         if (instance.user_phone && instance.otp) {
    //             twillio.send_message(instance.user_phone, "ThriftPlan OTP is " + instance.otp);
    //             //--//
    //             let users_instance = new dbInstance(db.users);
    //             let user_id = parseInt(String(instance.user_id) || 0) || 0;
    //             let [user, uErr] = await users_instance.fetchOne({ id: user_id });
    //             if (uErr) { console.log("uErr", uErr); }
    //             if (user && user.id) {
    //                 let email_body = "Dear " + uc_words(user.name) + "!<br><br>Please use the following One Time Password (OTP) to authenticate your account:<br><br>" + instance.otp + "<br><br>Please note that ThriftPlan takes your account security very seriously, we therefore ask you to not share this OTP with anyone. Our security team will never ask you to disclose or verify your password, OTP or credit Card details. If you have not requested an OTP or receive any suspicious e-mail asking you for sensitive details, please do not click onto any links or follow requests but instead forward the email to our investigation team at: tech@thriftplan.sa<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
    //                 sendMail(user.email, "OTP is generated", email_body);
    //             }
    //         }
    //     })(instance);
    // });
    db.users_otp.addHook("afterCreate", function (instance) {
        (async (instance) => {
            if (instance.otp) {
                // if (instance.user_phone && instance.otp) {
                // twillio.send_message(instance.user_phone, "ThriftPlan OTP is " + instance.otp);
                //--//
                let users_instance = new dbInstance(db.users);
                let user_id = parseInt(String(instance.user_id) || 0) || 0;
                let [user, uErr] = await users_instance.fetchOne({ id: user_id });
                if (uErr || !user) { console.log("uErr", uErr); return; }

                if (instance.type === 'login' || instance.type === 'forgot') {
                    let email_text = `Please use the following One Time Password (OTP) to authenticate your account:`;
                    let email_text_ar = `يرجى استخدام كلمة المرور التالية الصالحة لمرة واحدة (OTP) لتفعيل حسابك. مرحباً بك معنا في مستقبل التأمينات الإجتماعية! نحن نعمل لجعل تجربة الادخار الاستثماري لمستقبلك تجربة لا تُنسى، شكراً لثقتك في ثرفت بلان
                    
                    فريق ثرفت بلان`
                    sendMailTempAr(user.email, "OTP is generated", uc_words(user.name), instance.otp, email_text, email_text_ar);
                } else if (instance.type === 'verify') {
                    let email_text = `Please use the following One Time Password (OTP) to verify your account:`;
                    let email_text_ar = `يرجى استخدام كلمة المرور التالية الصالحة لمرة واحدة (OTP) لتفعيل حسابك. مرحباً بك معنا في مستقبل التأمينات الإجتماعية! نحن نعمل لجعل تجربة الادخار الاستثماري لمستقبلك تجربة لا تُنسى، شكراً لثقتك في ثرفت بلان
                    
                    فريق ثرفت بلان`
                    sendMailTempAr(user.email, "Verify your account", uc_words(user.name), instance.otp, email_text, email_text_ar);
                } else if (instance.type === 'withdraw') {
                    let email_text = `Please use the following One Time Password (OTP) to confirm your withdrawal:`;
                    let email_text_ar = `يرجى استخدام كلمة المرور التالية الصالحة لمرة واحدة (OTP) لتفعيل حسابك. مرحباً بك معنا في مستقبل التأمينات الإجتماعية! نحن نعمل لجعل تجربة الادخار الاستثماري لمستقبلك تجربة لا تُنسى، شكراً لثقتك في ثرفت بلان
                    
                    فريق ثرفت بلان`
                    sendMailTempAr(user.email, "Confirm your withdrawal", uc_words(user.name), instance.otp, email_text, email_text_ar);
                }
            }
        })(instance);
    });
    //--//
    //--//
    //--//
    db.terminate_otp.addHook("beforeCreate", function (instance) {
        if (!instance.otp || instance.otp === "" || instance.otp.length !== keys_length.otp) {
            if (server_config.host == server_config.hosts.production || server_config.host == server_config.hosts.pre_production) {
                instance.otp = strings.generateRandomOtp(keys_length.otp);
            } else {
                instance.otp = "010101";
            }
        }
    });
    // db.terminate_otp.addHook("afterCreate", function (instance) {
    //     (async (instance) => {
    //         if (instance.user_phone && instance.otp) {
    //             twillio.send_message(instance.user_phone, "ThriftPlan OTP is " + instance.otp);
    //             //--//
    //             let users_instance = new dbInstance(db.users);
    //             let user_id = parseInt(String(instance.user_id) || 0) || 0;
    //             let [user, uErr] = await users_instance.fetchOne({ id: user_id });
    //             if (uErr) { console.log("uErr", uErr); }
    //             if (user && user.id) {
    //                 let email_body = "Dear " + uc_words(user.name) + "!<br><br>Please use the following One Time Password (OTP) to authenticate your account:<br><br>" + instance.otp + "<br><br>Please note that ThriftPlan takes your account security very seriously, we therefore ask you to not share this OTP with anyone. Our security team will never ask you to disclose or verify your password, OTP or credit Card details. If you have not requested an OTP or receive any suspicious e-mail asking you for sensitive details, please do not click onto any links or follow requests but instead forward the email to our investigation team at: tech@thriftplan.sa<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
    //                 sendMail(user.email, "OTP is generated", email_body);
    //             }
    //         }
    //     })(instance);
    // });
    db.terminate_otp.addHook("afterCreate", function (instance) {
        (async (instance) => {
            if (instance.user_phone && instance.otp) {
                // twillio.send_message(instance.user_phone, "ThriftPlan OTP is " + instance.otp);
                //--//
                let users_instance = new dbInstance(db.users);
                let user_id = parseInt(String(instance.user_id) || 0) || 0;
                let [user, uErr] = await users_instance.fetchOne({ id: user_id });
                if (uErr) { console.log("uErr", uErr); }
                if (user && user.id) {
                    // let email_body = "Dear " + uc_words(user.name) + "!<br><br>Please use the following One Time Password (OTP) to authenticate your account:<br><br>" + instance.otp + "<br><br>Please note that ThriftPlan takes your account security very seriously, we therefore ask you to not share this OTP with anyone. Our security team will never ask you to disclose or verify your password, OTP or credit Card details. If you have not requested an OTP or receive any suspicious e-mail asking you for sensitive details, please do not click onto any links or follow requests but instead forward the email to our investigation team at: tech@thriftplan.sa<br><br>Thank you for trusting in ThriftPlan, we are working very hard to make every experience with us memorable. Welcome on board to the future of Social Security!<br><br>Your ThriftPlan Team";
                    let email_text = `Please use the following One Time Password (OTP) to procede further:`;
                    sendMailTempAr(user.email, "OTP is generated", uc_words(user.name), instance.otp, email_text, email_text);
                }
            }
        })(instance);
    });
    //--//
    //--//
    //--//
    db.authorizations.addHook("beforeCreate", function (instance) {
        // console.log("instance.access_token", instance.user_id);
        if (!instance.access_token || instance.access_token === "" || instance.access_token.length !== keys_length.access_token) {
            // instance.access_token = strings.generateRandomString(keys_length.access_token);
            let token = jwt.sign({
                id: instance.user_id,
                // exp: Math.floor(Date.now() / 1000) + (60 * 30),
                // iat: Math.floor(Date.now())
            }, "secrethriftplan");
            instance.access_token = token;
            let start = moment().format("YYYY-MM-DD HH:mm:ss");
            let end = moment(start).add(30, 'minutes').format("YYYY-MM-DD HH:mm:ss");
            instance.expired_at = end;
        }
        if (!instance.password_token || instance.password_token === "" || instance.password_token.length !== keys_length.password_token) {
            instance.password_token = strings.generateRandomString(keys_length.password_token);
        }
        if (instance.device_type) { instance.device_type = String(instance.device_type).trim().toLowerCase(); }
    });
    //--//
    db.push_sms.addHook("afterCreate", function (instance) {
        let json = instance.toJSON();
        if (json.sms_sent === "0" && json.send_to && json.message) {
            // twillio.send_message(json.send_to, json.message);
        }
    });
    db.push_notifications.addHook("afterCreate", function (instance) {
        (async (instance) => {
            let json = instance.toJSON();
            if (json.send_push === "1" && json.push_sent === "0") {
                let ios_tokens = [];
                let web_tokens = [];
                let android_tokens = [];
                let ids = [];
                //--//
                let [users, error] = await getUsersPushTokens(json.send_to, db);
                console.log(users);
                if (error) { console.log("error", error); }
                if (users && users.length > 0) {
                    for (let index in users) {
                        if (users.hasOwnProperty(index)) {
                            let user = users[index];
                            if (user.device_type && user.device_type === "ios") { ios_tokens.push(user.device_token); ids.push(user.user_id); }
                            else if (user.device_type && user.device_type === "web") { web_tokens.push(user.device_token); ids.push(user.user_id); }
                            else if (user.device_type && user.device_type === "android") { android_tokens.push(user.device_token); ids.push(user.user_id); }
                        }
                    }
                }
                //--//
                ios_tokens = array_chunks(ios_tokens, 1000);
                web_tokens = array_chunks(web_tokens, 1000);
                android_tokens = array_chunks(android_tokens, 1000);
                let push_data = { id: String(json.id), title: json.title, body: json.message, type: 'notification_push' };
                //--//
                if (ios_tokens && ios_tokens.length > 0) {
                    for (let index in ios_tokens) {
                        if (ios_tokens.hasOwnProperty(index)) {
                            let tokens = ios_tokens[index];
                            let message = {
                                data: push_data,
                                notification: push_data,
                                registration_ids: tokens
                            };
                            PUSH.send_push(message);
                        }
                    }
                }
                if (web_tokens && web_tokens.length > 0) {
                    for (let index in web_tokens) {
                        if (web_tokens.hasOwnProperty(index)) {
                            let tokens = web_tokens[index];
                            let message = {
                                data: push_data,
                                notification: push_data,
                                registration_ids: tokens
                            };
                            PUSH.send_push(message);
                        }
                    }
                }
                if (android_tokens && android_tokens.length > 0) {
                    for (let index in android_tokens) {
                        if (android_tokens.hasOwnProperty(index)) {
                            let tokens = android_tokens[index];
                            let message = {
                                data: push_data,
                                notification: push_data,
                                registration_ids: tokens
                            };
                            PUSH.send_push(message);
                        }
                    }
                }
                let admin;
                let eaErr;
                let push_instance = new dbInstance(db.push_notifications);
                let findQuery = {
                    where: { id: json.id }
                };
                [admin, eaErr] = await push_instance.findOne(findQuery);
                if (eaErr) { console.log("eaErr", eaErr); }
                if (admin) {
                    let update_body = {
                        to_ids: instance.to_ids
                    };
                    push_instance.model = admin;
                    console.log(json.id);
                    console.log(ids);
                    [admin, eaErr] = await push_instance.update(update_body);
                    if (eaErr) { console.log("eaErr", eaErr); }
                }
                // if(json.send_to === 'admins'){ json.send_to = 'adminPortal' }
                // if(json.send_to === 'employers'){ json.send_to = 'employerPortal' }
                // if(json.send_to === 'employees'){ json.send_to = 'employeePortal' }
                // if(json.send_to === 'banks'){ json.send_to = 'fundManagerPortal' }
                // let _instance = new dbInstance(db.app_logs);
                // let options = { from_id: json.from_id, to_ids: ids.join(','), label_tag: json.title, message_log: json.message, message_notify: json.message };
                // let options = { from_id: json.from_id, to_ids: ids.join(','), label_tag: json.title, message_log: json.message, message_notify: json.message, portal_id: json.send_to };
                // let [log, err] = await _instance.create(options);
            }
        })(instance);
    });
    //--//
    // db.employers_employees.addHook("beforeSave", function (instance) {
    //     instance.contribution_amount = (instance.salary) * (instance.contribution_percent / 100);
    // });
    //--//
    db.app_logs.addHook("beforeCreate", function (instance) {
        instance.to_ids = filter_ids(instance.to_ids || "").join(",");
        // task 1377 : for hide identity
        instance.message_notify = instance.message_notify || instance.message_log;
    });
    db.app_logs.addHook("afterCreate", function (instance) {
        (async (instance) => {
            //--//
            let json = instance.toJSON();
            json.to_ids = filter_ids(json.to_ids);
            json.label_tag = uc_words(json.label_tag || "ThriftPlan Update");
            let mapObj = { "To": "to", "In": "in", "Of": "of", "From": "from" };
            json.label_tag = json.label_tag.replace(/\b(?:to|in|of|from)\b/gi, matched => mapObj[matched]);
            //--//
            if (json.to_ids && json.to_ids.length > 0) {
                let device_tokens = await getUsersDeviceTokens(json.to_ids, db);
                if (device_tokens) {
                    device_tokens = device_tokens.split(",");
                    let push_data = { id: "0", title: json.label_tag, body: json.message_notify || json.message_log, type: 'activity_push' };
                    let message = {
                        data: push_data,
                        notification: push_data,
                        registration_ids: device_tokens
                    };
                    PUSH.send_push(message);
                }
            }
        })(instance);
    });
    db.app_logs.addHook("afterSave", function (instance) {
        (async (instance) => {
            //--//
            let json = instance.toJSON();
            json.to_ids = filter_ids(json.to_ids);
            json.label_tag = String(json.label_tag).trim().toLowerCase();
            //--//
            // console.log("Logs afterSave", {
            //     id: json.id,
            //     to_ids: json.to_ids,
            //     label_tag: json.label_tag,
            //     message_log: json.message_log,
            //     message_email: (json.message_email && json.message_email !== "" && json.message_email !== null)
            // });
            if (json.to_ids && json.to_ids.length > 0) {
                // let email_body = json.message_email;
                let email_text = json.message_email;
                let email_subject = uc_words(json.label_tag);
                //--//
                if (json.message_email && json.message_email !== "" && json.message_email !== null) {
                    let users_emails = await getUsersEmails(json.to_ids, db);
                    // if (users_emails !== "" && email_body !== "") { sendMail(users_emails, email_subject, email_body); }
                    if (users_emails !== "" && email_text !== "") {
                        sendMailTempAr(users_emails, email_subject, null, null, email_text, json.message_email_ar ? json.message_email_ar : email_text);
                    }
                }
                return true;
                //--//
                // let portalID = json.portal_id;
                // if(portalID === "adminPortal"){
                //     if(json.label_tag === "thriftplan manager created"){}
                //     if(json.label_tag === "thriftplan manager updated"){}
                //     if(json.label_tag === "investment bank created"){}
                //     if(json.label_tag === "investment bank updated"){}
                //     if(json.label_tag === "employer manager created"){}
                //     if(json.label_tag === "employer manager updated"){}
                //     if(json.label_tag === "employer created"){}
                //     if(json.label_tag === "employer updated"){}
                //     if(json.label_tag === "investment fund created"){}
                //     if(json.label_tag === "investment fund updated"){}
                //     if(json.label_tag === "investment fund assigned to employer"){}
                //     if(json.label_tag === "investment fund removed from employer"){}
                //     if(json.label_tag === "re-allocation request updated"){}
                // }
                // else if(portalID === "employerPortal"){
                //     if(json.label_tag === "employer updated"){}
                //     if(json.label_tag === "contribution request created"){}
                //     if(json.label_tag === "employee created"){}
                //     if(json.label_tag === "employee updated"){}
                //     if(json.label_tag === "vested amount transferred"){}
                //     if(json.label_tag === "employer manager created"){}
                //     if(json.label_tag === "employer manager updated"){}
                //     if(json.label_tag === "fund group created"){}
                //     if(json.label_tag === "fund group updated"){}
                //     if(json.label_tag === "investment fund assigned to fund group"){}
                //     if(json.label_tag === "investment fund removed from fund group"){}
                //     if(json.label_tag === "employee added in fund group"){}
                //     if(json.label_tag === "employee removed from fund group"){}
                //     if(json.label_tag === "withdrawal request updated"){}
                // }
                // else if(portalID === "fundManagerPortal"){
                //     if(json.label_tag === "withdrawal request updated"){}
                //     if(json.label_tag === "contribution request updated"){}
                //     if(json.label_tag === "investment fund manager created"){}
                //     if(json.label_tag === "investment fund manager updated"){}
                //     if(json.label_tag === "investment fund created"){}
                //     if(json.label_tag === "investment fund updated"){}
                //     if(json.label_tag === "re-allocation request updated"){}
                // }
                // else if(portalID === "employeePortal" || portalID === "mobilePortal"){
                //     if(json.label_tag === "profile updated"){}
                //     if(json.label_tag === "risk profile selected"){}
                //     if(json.label_tag === "re-allocation request created"){}
                //     if(json.label_tag === "re-allocation request created"){}
                //     if(json.label_tag === "withdrawal request created"){}
                // }
            }
        })(instance);
    });

    //--//
    db.assets.addHook("afterUpdate", async function (instance) {
        if (instance.changed("currency") || (instance.changed("nav_per_unit")) || instance.changed("current_value")) {
            let list;
            let eaErr;
            let create_body = {
                asset_id: instance.id,
                old_currency: instance.old_currency,
                currency: instance.currency,
                old_current_value: instance.old_current_value,
                current_value: instance.current_value,
                old_nav_per_unit: instance.old_nav_per_unit,
                nav_per_unit: instance.nav_per_unit,
                nav_change: instance.nav_per_unit - instance.old_nav_per_unit,
                valuation_date: moment().format("YYYY-MM-DD")
            };
            let assets_audit = new dbInstance(db.assets_audit);
            [list, eaErr] = await assets_audit.create(create_body)
            if (eaErr) { console.log("eaErr", eaErr); }
            // else{console.log('created', list)}
            //--//
            if (!instance.changed("nav_per_unit")) {
                return;
            }
            cronJob.setAssetProfit(instance.id, instance.nav_per_unit, instance.old_nav_per_unit, db, dbInstance)
            // let findQuery = {
            //     raw: true,
            //     nested: true,
            //     where: { asset_id: instance.id, active: "1" },
            //     attributes: [[sequelize.literal("GROUP_CONCAT(DISTINCT `employee_id`)"), "employee_ids"]],
            //     order: [["employee_id", "DESC"]]
            // };
            // let aInstance = new dbInstance(db.transactions);
            // let [ids, aErr] = await aInstance.findOne(findQuery);
            // if (aErr) { console.log("aErr", aErr); }
            // console.log("ids.employee_ids", ids.employee_ids);
            // if (ids && ids.employee_ids && ids.employee_ids.length > 0) {
            //     cronJob.createProfit(ids.employee_ids, db, dbInstance, sequelize)
            // }


            // let findQuery1 = {
            //     raw: true,
            //     nested: true,
            //     where: { asset_id: instance.id, active: "1" },
            //     attributes: [[sequelize.literal("GROUP_CONCAT(DISTINCT `fund_id`)"), "fund_ids"]],
            //     order: [["fund_id", "DESC"]]
            // };
            // let aInstance1 = new dbInstance(db.funds_assets);
            // let [ids1, aErr1] = await aInstance1.findOne(findQuery1);
            // if (aErr1) { console.log("aErr1", aErr1); }
            // // console.log("fundids", ids1);
            // if (ids && ids.employee_ids && ids.employee_ids.length > 0) {
            //     fund_profit.createFundProfit(ids1, db, dbInstance, sequelize, Op)
            // }
        }
    });
    //--//
    db.invoices.addHook("afterCreate", async function (instance) {
        let iInstance = new dbInstance(db.invoices);
        let findQuery = { where: { id: instance.id } };
        let [invoice, iErr] = await iInstance.findOne(findQuery);
        if (iErr) { console.log("iErr", iErr); }
        const invoice_prefix = function (num) {
            return "TPI" + String(num).padStart(8, '0')
        }
        let update_body = {
            invoice_no: invoice_prefix(instance.id)
        };
        iInstance.model = invoice;
        let [uInvoice, uErr] = await iInstance.update(update_body);
        if (uErr) { console.log("uErr", uErr); }
    });
};
