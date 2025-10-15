// Local schema type aliases to satisfy templates
import type {
  URLType,
  SectionWithItem as SectionWithItemBase,
  ExperienceItem,
  EducationItem,
  AwardItem,
  CertificationItem,
  SkillItem,
  InterestItem,
  PublicationItem,
  VolunteerItem,
  LanguageItem,
  ProjectItem,
  ReferenceItem,
  CustomItem,
} from "../adapters/ResumeArtboardProvider";

export type URL = URLType;
export type SectionKey = string;
export type SectionWithItem<T> = SectionWithItemBase<T>;

export type Experience = ExperienceItem;
export type Education = EducationItem;
export type Award = AwardItem;
export type Certification = CertificationItem;
export type Skill = SkillItem;
export type Interest = InterestItem;
export type Publication = PublicationItem;
export type Volunteer = VolunteerItem;
export type Language = LanguageItem;
export type Project = ProjectItem;
export type Reference = ReferenceItem;

export type Profile = {
  id: string;
  visible: boolean;
  username: string;
  network?: string;
  icon?: string;
  url: URL;
};

export type CustomSection = CustomItem;
export type CustomSectionGroup = SectionWithItem<CustomItem>;
