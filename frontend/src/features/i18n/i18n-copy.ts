import type { ProjectRole } from '../projects/project-types';

export type AppLanguage = 'ru' | 'en';

export interface AppCopy {
  common: {
    appName: string;
    email: string;
    password: string;
    fullName: string;
    name: string;
    slug: string;
    description: string;
    role: string;
    cancel: string;
    save: string;
    create: string;
    noName: string;
  };
  languageSwitcher: {
    label: string;
    ru: string;
    en: string;
  };
  navigation: {
    dashboard: string;
    projects: string;
    profile: string;
    logout: string;
  };
  auth: {
    login: {
      title: string;
      subtitle: string;
      submit: string;
      switchLink: string;
      fallbackError: string;
    };
    register: {
      title: string;
      subtitle: string;
      submit: string;
      switchLink: string;
      fallbackError: string;
    };
  };
  notFound: {
    message: string;
    action: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    projectsTitle: string;
    projectsHint: string;
    userTitle: string;
    userHint: string;
    accessTitle: string;
    accessValue: string;
    accessHint: string;
    loadFailed: string;
  };
  profile: {
    title: string;
    subtitle: string;
    save: string;
    updateFailed: string;
  };
  projects: {
    title: string;
    subtitle: string;
    newProject: string;
    actionFailed: string;
    loadFailed: string;
    noDescription: string;
    updatedAt: string;
    open: string;
    edit: string;
    delete: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  projectForm: {
    createTitle: string;
    editTitle: string;
    slugHelper: string;
  };
  projectDetail: {
    titleFallback: string;
    roleSubtitle: (role: string) => string;
    loadFailed: string;
    saveFailed: string;
    membersFailed: string;
    settingsTitle: string;
    readonlyInfo: string;
    saveChanges: string;
    membersTitle: string;
    membersSubtitle: string;
    userEmailLabel: string;
    addMember: string;
    loadMembersFailed: string;
    remove: string;
    leaveProject: string;
    you: string;
    inactive: string;
  };
  roles: Record<ProjectRole, string>;
  validation: {
    emailInvalid: string;
    passwordMin: string;
    min2: string;
    max255: string;
    slugMax: string;
    slugPattern: string;
    descriptionMax: string;
  };
}

export const appCopy: Record<AppLanguage, AppCopy> = {
  ru: {
    common: {
      appName: 'Proton Kanban',
      email: 'Email',
      password: 'Пароль',
      fullName: 'Имя',
      name: 'Название',
      slug: 'Slug',
      description: 'Описание',
      role: 'Роль',
      cancel: 'Отмена',
      save: 'Сохранить',
      create: 'Создать',
      noName: 'Без имени',
    },
    languageSwitcher: {
      label: 'Язык интерфейса',
      ru: 'RU',
      en: 'EN',
    },
    navigation: {
      dashboard: 'Дашборд',
      projects: 'Проекты',
      profile: 'Профиль',
      logout: 'Выйти',
    },
    auth: {
      login: {
        title: 'Вход',
        subtitle: 'Войдите в систему, чтобы управлять проектами и развивать продукт дальше.',
        submit: 'Войти',
        switchLink: 'Нет аккаунта? Зарегистрироваться',
        fallbackError: 'Не удалось войти',
      },
      register: {
        title: 'Регистрация',
        subtitle: 'Создайте первого пользователя и сразу попадите в приложение.',
        submit: 'Зарегистрироваться',
        switchLink: 'Уже есть аккаунт? Войти',
        fallbackError: 'Не удалось создать пользователя',
      },
    },
    notFound: {
      message: 'Такой страницы пока нет.',
      action: 'На главную',
    },
    dashboard: {
      title: 'Дашборд',
      subtitle: 'Краткий обзор рабочего пространства и модели доступа.',
      projectsTitle: 'Проекты',
      projectsHint: 'В списке только проекты, где у вас есть явная роль.',
      userTitle: 'Пользователь',
      userHint: 'Данные профиля приходят из /users/me.',
      accessTitle: 'Модель доступа',
      accessValue: 'RBAC',
      accessHint: 'Проекты используют роли owner, manager, member и viewer.',
      loadFailed: 'Не удалось загрузить проекты',
    },
    profile: {
      title: 'Профиль',
      subtitle: 'Обновите имя, которое показывается по всему приложению.',
      save: 'Сохранить профиль',
      updateFailed: 'Не удалось обновить профиль',
    },
    projects: {
      title: 'Проекты',
      subtitle: 'Теперь в каждом проекте видна ваша роль и доступные действия.',
      newProject: 'Новый проект',
      actionFailed: 'Не удалось выполнить действие',
      loadFailed: 'Не удалось загрузить проекты',
      noDescription: 'Пока без описания',
      updatedAt: 'Обновлено',
      open: 'Открыть',
      edit: 'Редактировать',
      delete: 'Удалить',
      emptyTitle: 'Пока нет проектов',
      emptyDescription: 'Создайте первый проект, чтобы назначать роли и работать вместе с командой.',
    },
    projectForm: {
      createTitle: 'Новый проект',
      editTitle: 'Редактировать проект',
      slugHelper: 'Например: proton-kanban',
    },
    projectDetail: {
      titleFallback: 'Проект',
      roleSubtitle: (role: string) => `Ваша роль: ${role}`,
      loadFailed: 'Не удалось загрузить проект',
      saveFailed: 'Не удалось сохранить изменения',
      membersFailed: 'Не удалось обновить участников',
      settingsTitle: 'Настройки проекта',
      readonlyInfo: 'У вас только доступ на чтение к настройкам проекта.',
      saveChanges: 'Сохранить изменения',
      membersTitle: 'Участники',
      membersSubtitle: 'Владелец управляет всеми не-owner ролями. Менеджер управляет ролями member и viewer.',
      userEmailLabel: 'Email пользователя',
      addMember: 'Добавить участника',
      loadMembersFailed: 'Не удалось загрузить участников',
      remove: 'Удалить',
      leaveProject: 'Покинуть проект',
      you: 'Вы',
      inactive: 'Неактивен',
    },
    roles: {
      owner: 'Владелец',
      manager: 'Менеджер',
      member: 'Участник',
      viewer: 'Наблюдатель',
    },
    validation: {
      emailInvalid: 'Введите корректный email',
      passwordMin: 'Минимум 8 символов',
      min2: 'Минимум 2 символа',
      max255: 'Слишком длинное значение',
      slugMax: 'Слишком длинный slug',
      slugPattern: 'Только строчные латинские буквы, цифры и дефис',
      descriptionMax: 'Слишком длинное описание',
    },
  },
  en: {
    common: {
      appName: 'Proton Kanban',
      email: 'Email',
      password: 'Password',
      fullName: 'Full name',
      name: 'Name',
      slug: 'Slug',
      description: 'Description',
      role: 'Role',
      cancel: 'Cancel',
      save: 'Save',
      create: 'Create',
      noName: 'No name',
    },
    languageSwitcher: {
      label: 'Interface language',
      ru: 'RU',
      en: 'EN',
    },
    navigation: {
      dashboard: 'Dashboard',
      projects: 'Projects',
      profile: 'Profile',
      logout: 'Logout',
    },
    auth: {
      login: {
        title: 'Login',
        subtitle: 'Sign in to manage projects and keep moving the product forward.',
        submit: 'Login',
        switchLink: 'No account yet? Register',
        fallbackError: 'Failed to sign in',
      },
      register: {
        title: 'Register',
        subtitle: 'Create the first user and go straight into the app.',
        submit: 'Register',
        switchLink: 'Already have an account? Login',
        fallbackError: 'Failed to create the user',
      },
    },
    notFound: {
      message: 'This page does not exist yet.',
      action: 'Back Home',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'A quick overview of the workspace and the current access model.',
      projectsTitle: 'Projects',
      projectsHint: 'Only projects where you have an explicit role are listed here.',
      userTitle: 'User',
      userHint: 'Profile data comes from /users/me.',
      accessTitle: 'Access Model',
      accessValue: 'RBAC',
      accessHint: 'Projects use owner, manager, member and viewer roles.',
      loadFailed: 'Failed to load projects',
    },
    profile: {
      title: 'Profile',
      subtitle: 'Update the name shown across the workspace.',
      save: 'Save Profile',
      updateFailed: 'Failed to update the profile',
    },
    projects: {
      title: 'Projects',
      subtitle: 'Each project now shows your effective role and available actions.',
      newProject: 'New Project',
      actionFailed: 'Failed to complete the action',
      loadFailed: 'Failed to load projects',
      noDescription: 'No description yet',
      updatedAt: 'Updated',
      open: 'Open',
      edit: 'Edit',
      delete: 'Delete',
      emptyTitle: 'No projects yet',
      emptyDescription: 'Create your first project to assign roles and collaborate with your team.',
    },
    projectForm: {
      createTitle: 'New Project',
      editTitle: 'Edit Project',
      slugHelper: 'Example: proton-kanban',
    },
    projectDetail: {
      titleFallback: 'Project',
      roleSubtitle: (role: string) => `Your role: ${role}`,
      loadFailed: 'Failed to load the project',
      saveFailed: 'Failed to save changes',
      membersFailed: 'Failed to update members',
      settingsTitle: 'Project Settings',
      readonlyInfo: 'You have read-only access to the project settings.',
      saveChanges: 'Save Changes',
      membersTitle: 'Members',
      membersSubtitle: 'Owners can manage every non-owner role. Managers can manage member and viewer roles.',
      userEmailLabel: 'User email',
      addMember: 'Add Member',
      loadMembersFailed: 'Failed to load members',
      remove: 'Remove',
      leaveProject: 'Leave Project',
      you: 'You',
      inactive: 'Inactive',
    },
    roles: {
      owner: 'Owner',
      manager: 'Manager',
      member: 'Member',
      viewer: 'Viewer',
    },
    validation: {
      emailInvalid: 'Enter a valid email address',
      passwordMin: 'Minimum 8 characters',
      min2: 'Minimum 2 characters',
      max255: 'Value is too long',
      slugMax: 'Slug is too long',
      slugPattern: 'Use lowercase latin letters, numbers, and hyphens only',
      descriptionMax: 'Description is too long',
    },
  },
};
