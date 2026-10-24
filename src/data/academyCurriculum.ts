import { EngineeringDiscipline } from '../types';
import { conventionalNdtDiscipline } from './curriculum/disciplines/conventionalNdt';

export const ENGINEERING_DISCIPLINES: EngineeringDiscipline[] = [
  conventionalNdtDiscipline,
  {
    id: 'ndt_advanced',
    titleAr: 'الفحص المتقدم (Advanced NDT)',
    titleEn: 'Advanced NDT (ET, PAUT, TOFD, AE, LT)',
    category: 'ndt_advanced',
    badgeColor: 'cyan',
    overviewAr: 'تقنيات الفحص المتقدمة التي تعتمد على إشارات إلكترونية ومعالجة رقمية.',
    overviewEn: 'Advanced inspection techniques relying on electronic signals and digital processing.',
    keyTechniques: ['ET', 'PAUT', 'TOFD', 'AE', 'LT'],
    globalAccreditations: ['ASNT SNT-TC-1A', 'ISO 9712'],
    targetIndustries: ['Power Generation', 'Oil & Gas', 'Aerospace'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'المستوى الأول',
        nameEn: 'Level 1',
        academicStageAr: 'أساسيات الفحص المتقدم',
        academicStageEn: 'Advanced NDT Fundamentals',
        targetRoleAr: 'تنفيذ الفحص تحت إشراف',
        targetRoleEn: 'Perform testing under supervision',
        prerequisitesAr: 'إتمام المرحلة الأكاديمية',
        prerequisitesEn: 'Academic stage completion',
        trainingHours: 40,
        experienceMonths: 3,
        internationalCerts: ['ASNT Level I'],
        applicableCodes: ['ASME Sec V'],
        responsibilitiesAr: ['تنفيذ الفحص وتسجيل النتائج', 'ضبط إعدادات الحزمة والمسح وفق الإجراء المعتمد'],
        responsibilitiesEn: ['Perform testing and record results', 'Set beam and scan parameters to the approved procedure'],
        modules: [
          {
            id: 'mod_adv_ut',
            titleAr: 'وحدة PAUT/TOFD: التوجيه الإلكتروني وتحديد الأبعاد بالحيود',
            titleEn: 'Module PAUT/TOFD: Electronic Beam Steering and Diffraction Sizing',
            duration: '32 ساعة (12 نظري + 20 عملي)',
            topicsAr: [
              'بنية المسبار المصفوفي: العناصر، الميل، والتأخير الزمني لكل عنصر (Focal Laws)',
              'التوجيه الإلكتروني والتركيز: حساب زاوية الحزمة وعمق البؤرة',
              'المعايرة على كتل ASTM/ISO المخصصة للمصفوفة والتحقق من التغطية',
              'TOFD: هندسة الإرسال والاستقبال، إشارات الرأس والطرف السفلي والعلوي',
              'قياس ارتفاع العيب: المسافة الزمنية بين إشارات الأطراف وحدود الدقة',
              'الحدود: حساسية TOFD للعيوب القريبة من السطح، وتأثر PAUT بجودة الاقتران'
            ],
            topicsEn: [
              'Array probe anatomy: elements, pitch, and per-element focal laws',
              'Electronic steering and focusing: beam angle and focal depth calculation',
              'Calibration on dedicated ASTM/ISO array blocks and coverage verification',
              'TOFD: transmitter-receiver geometry and lateral, back-wall and tip diffracted signals',
              'Flaw height sizing from tip signal time separation and its accuracy limits',
              'Limits: TOFD near-surface dead zone, and PAUT sensitivity to coupling quality'
            ],
            learningOutcomesAr: [
              'يبرمج قانون تركيز لحزمة 55° على عمق 30 mm ويؤكد التغطية على كتلة معايرة',
              'يفسر صورة S-scan ويحدد مؤشراً طرفياً',
              'يقيس ارتفاع عيب بـ TOFD ويقدّر الخطأ من زمن النبضة',
              'يكتب بيان حدود للطريقة قبل تسليم النتائج'
            ],
            learningOutcomesEn: [
              'Program a 55° focal law at 30 mm depth and confirm coverage on a calibration block',
              'Interpret an S-scan image and identify a tip diffraction indication',
              'Size a flaw height with TOFD and estimate error from pulse duration',
              'Write a method-limits statement before delivering results'
            ],
            quizId: 'ut-advanced-q1'
          },
          {
            id: 'mod_adv_et',
            titleAr: 'وحدة ET: التيارات الدوامية للأسطح والأنابيب',
            titleEn: 'Module ET: Eddy Current Testing of Surfaces and Tubing',
            duration: '32 ساعة (12 نظري + 20 عملي)',
            topicsAr: [
              'الحث الكهرومغناطيسي وعمق الاختراق ومعادلة δ',
              'المسابر المطلقة والتفاضلية وملفات bobbin وpancake',
              'المستوي الممانعي وقراءة الطور وتقدير العمق',
              'مراجع المعايرة والترشيح والترددات المتعددة',
              'كشف الشروخ السطحية وفحص الأنابيب وقياس الموصلية',
              'حدود ET: المواد الموصلة فقط، النفاذية، رفع الملف، الإشارات الهندسية'
            ],
            topicsEn: [
              'Electromagnetic induction, depth of penetration and the δ equation',
              'Absolute, differential, bobbin and pancake coils',
              'The impedance plane, phase reading and depth estimation',
              'Reference calibration, filtering and multiple frequencies',
              'Surface crack detection, tube inspection and conductivity measurement',
              'ET limits: conductive materials only, permeability, lift-off, geometric signals'
            ],
            learningOutcomesAr: [
              'يحسب عمق الاختراق ويختار التردد المناسب لتطبيق محدد',
              'يعاير مسباراً على عيب مرجعي ويقرأ إشارة على المستوي الممانعي',
              'يمسح سطحاً باتجاهين ويكشف شرخاً سطحياً موضعياً',
              'يفصل إشارة دعم أنبوب عن إشارة عيب بتردد أو طور مختلف',
              'يكتب بيان حدود ET قبل تسليم أي نتيجة'
            ],
            learningOutcomesEn: [
              'Calculate depth of penetration and select a suitable frequency for a given application',
              'Calibrate a probe on a reference flaw and read the impedance-plane signal',
              'Scan a surface in two directions and detect a local surface crack',
              'Separate a tube support signal from a flaw using another frequency or phase',
              'Write an ET limits statement before delivering any result'
            ],
            quizId: 'et-principles-q1'
          }
        ]
      }
    ]
  },
  {
    id: 'welding_inspection',
    titleAr: 'فحص اللحام (Welding Inspection)',
    titleEn: 'Welding Inspection',
    category: 'welding',
    badgeColor: 'orange',
    overviewAr: 'فحص عمليات اللحام وضمان جودة الوصلات.',
    overviewEn: 'Welding inspection and joint quality assurance.',
    keyTechniques: ['VT Weld', 'WPS/PQR', 'Heat Input'],
    globalAccreditations: ['AWS CWI', 'CSWIP'],
    targetIndustries: ['Construction', 'Pipelines', 'Shipbuilding'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'مفتش لحام أول',
        nameEn: 'Welding Inspector Level 1',
        academicStageAr: 'أساسيات فحص اللحام',
        academicStageEn: 'Welding inspection fundamentals',
        targetRoleAr: 'فحص الوصلات اللحامية',
        targetRoleEn: 'Inspect welded joints',
        prerequisitesAr: 'خبرة في اللحام',
        prerequisitesEn: 'Welding experience',
        trainingHours: 60,
        experienceMonths: 6,
        internationalCerts: ['AWS CWI'],
        applicableCodes: ['AWS D1.1', 'ASME IX'],
        responsibilitiesAr: ['فحص بصري وتوثيق'],
        responsibilitiesEn: ['Visual inspection and documentation'],
        modules: []
      }
    ]
  },
  {
    id: 'pwht_metallurgy',
    titleAr: 'المعالجة الحرارية وعلم المعادن (PWHT/Metallurgy)',
    titleEn: 'PWHT & Metallurgy',
    category: 'pwht',
    badgeColor: 'red',
    overviewAr: 'المعالجة بعد اللحام وعلم المعادن والبنية المجهرية.',
    overviewEn: 'Post-weld heat treatment and metallurgy.',
    keyTechniques: ['PWHT', 'Hardness', 'PMI'],
    globalAccreditations: ['ASNT Level II/III'],
    targetIndustries: ['Refineries', 'Power Plants'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'تقني معالجة حرارية',
        nameEn: 'PWHT Technician',
        academicStageAr: 'أساسيات المعالجة الحرارية',
        academicStageEn: 'PWHT fundamentals',
        targetRoleAr: 'تنفيذ ومراقبة دورات PWHT',
        targetRoleEn: 'Execute and monitor PWHT cycles',
        prerequisitesAr: 'معرفة بعلم المعادن',
        prerequisitesEn: 'Metallurgy knowledge',
        trainingHours: 40,
        experienceMonths: 3,
        internationalCerts: [],
        applicableCodes: ['ASME VIII', 'AWS D1.1'],
        responsibilitiesAr: ['مراقبة الترموكبلات والمنحنيات'],
        responsibilitiesEn: ['Monitor thermocouples and curves'],
        modules: []
      }
    ]
  },
  {
    id: 'api_inspection',
    titleAr: 'فحص API والأنابيب',
    titleEn: 'API & Piping Inspection',
    category: 'api',
    badgeColor: 'emerald',
    overviewAr: 'فحص المعدات والأنابيب وفق أكواد API.',
    overviewEn: 'Equipment and piping inspection per API codes.',
    keyTechniques: ['API 510', 'API 570', 'API 653'],
    globalAccreditations: ['API 510', 'API 570', 'API 653'],
    targetIndustries: ['Refineries', 'Chemical Plants'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'مفتش أنابيب',
        nameEn: 'Piping Inspector',
        academicStageAr: 'أساسيات فحص الأنابيب',
        academicStageEn: 'Piping inspection basics',
        targetRoleAr: 'فحص الأنابيب وحساب العمر المتبقي',
        targetRoleEn: 'Inspect piping and calculate remaining life',
        prerequisitesAr: 'خبرة هندسية',
        prerequisitesEn: 'Engineering experience',
        trainingHours: 80,
        experienceMonths: 12,
        internationalCerts: ['API 570'],
        applicableCodes: ['API 570', 'API 574'],
        responsibilitiesAr: ['فحص دوري وتقييم'],
        responsibilitiesEn: ['Periodic inspection and assessment'],
        modules: []
      }
    ]
  },
  {
    id: 'coating_corrosion',
    titleAr: 'الدهانات والتآكل (Coating/Corrosion)',
    titleEn: 'Coating & Corrosion',
    category: 'coating',
    badgeColor: 'yellow',
    overviewAr: 'فحص الطلاءات وآليات التآكل.',
    overviewEn: 'Coating inspection and corrosion mechanisms.',
    keyTechniques: ['Coating Inspection', 'Corrosion Mapping'],
    globalAccreditations: ['AMPP CIP'],
    targetIndustries: ['Marine', 'Offshore', 'Infrastructure'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'مفتش دهانات',
        nameEn: 'Coating Inspector',
        academicStageAr: 'أساسيات فحص الدهانات',
        academicStageEn: 'Coating inspection basics',
        targetRoleAr: 'فحص جودة الطلاءات',
        targetRoleEn: 'Inspect coating quality',
        prerequisitesAr: 'خبرة سطحية',
        prerequisitesEn: 'Surface experience',
        trainingHours: 40,
        experienceMonths: 3,
        internationalCerts: ['AMPP CIP Level 1'],
        applicableCodes: ['SSPC', 'ISO 8501'],
        responsibilitiesAr: ['فحص السطح والسماكة'],
        responsibilitiesEn: ['Surface and thickness inspection'],
        modules: []
      }
    ]
  },
  {
    id: 'qa_qc',
    titleAr: 'ضمان الجودة وضبط الجودة (QA/QC)',
    titleEn: 'Quality Assurance & Quality Control',
    category: 'quality',
    badgeColor: 'violet',
    overviewAr: 'أنظمة الجودة والتفتيش والتوثيق الفني.',
    overviewEn: 'Quality systems, inspection and technical traceability.',
    keyTechniques: ['ITP', 'NCR', 'Documentation'],
    globalAccreditations: ['ISO 9001', 'ISO 17025'],
    targetIndustries: ['All Industries'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'تقني جودة',
        nameEn: 'Quality Technician',
        academicStageAr: 'أساسيات الجودة',
        academicStageEn: 'Quality fundamentals',
        targetRoleAr: 'توثيق ومتابعة الجودة',
        targetRoleEn: 'Document and follow up quality',
        prerequisitesAr: 'خلفية هندسية',
        prerequisitesEn: 'Engineering background',
        trainingHours: 30,
        experienceMonths: 3,
        internationalCerts: [],
        applicableCodes: ['ISO 9001'],
        responsibilitiesAr: ['إعداد ITP وتوثيق النتائج'],
        responsibilitiesEn: ['Prepare ITP and document results'],
        modules: []
      }
    ]
  },
  {
    id: 'asset_integrity_rope',
    titleAr: 'سلامة الأصول والتفتيش (Asset Integrity)',
    titleEn: 'Asset Integrity & Rope Access',
    category: 'integrity',
    badgeColor: 'teal',
    overviewAr: 'إدارة سلامة الأصول والتفتيش بالحبال.',
    overviewEn: 'Asset integrity management and rope access inspection.',
    keyTechniques: ['RBI', 'FFS', 'Rope Access'],
    globalAccreditations: ['API 580', 'IRATA'],
    targetIndustries: ['Offshore', 'Construction', 'Utilities'],
    levels: [
      {
        levelId: 'level1',
        tierCategory: 'professional',
        nameAr: 'تقني سلامة أصول',
        nameEn: 'Asset Integrity Technician',
        academicStageAr: 'أساسيات سلامة الأصول',
        academicStageEn: 'Asset integrity fundamentals',
        targetRoleAr: 'فحص وتقييم سلامة المنشآت',
        targetRoleEn: 'Inspect and assess structural integrity',
        prerequisitesAr: 'تأهيل NDT',
        prerequisitesEn: 'NDT qualification',
        trainingHours: 60,
        experienceMonths: 6,
        internationalCerts: ['IRATA Level 1'],
        applicableCodes: ['API 580', 'API 581'],
        responsibilitiesAr: ['تفتيش وتقييم المخاطر'],
        responsibilitiesEn: ['Inspection and risk assessment'],
        modules: []
      }
    ]
  }
];

export interface WorkshopLab {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const WORKSHOP_LABS: WorkshopLab[] = [
  { id: 'ut_lab', titleAr: 'مختبر UT', titleEn: 'UT Lab', descriptionAr: 'محاكاة A-scan', descriptionEn: 'A-scan simulation' },
  { id: 'pt_mt_darkroom', titleAr: 'غرفة PT/MT المظلمة', titleEn: 'PT/MT Darkroom', descriptionAr: 'محاكاة فحص السطح', descriptionEn: 'Surface inspection simulation' },
  { id: 'rt_illuminator', titleAr: 'مصدر RT', titleEn: 'RT Source', descriptionAr: 'محاكاة التصوير الإشعاعي', descriptionEn: 'Radiography simulation' },
  { id: 'weld_inspector_gauge', titleAr: 'مقاييس اللحام', titleEn: 'Weld Gauges', descriptionAr: 'أدوات قياس الوصلة', descriptionEn: 'Joint measurement tools' },
  { id: 'api_vessel_life', titleAr: 'عمر الوعاء', titleEn: 'Vessel Life', descriptionAr: 'حسابات API', descriptionEn: 'API calculations' },
];