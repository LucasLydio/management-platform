import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";

import { TaskIntegrationsService } from "../../../integrations/services/task-integrations.service";
import type { TaskIntegrationResult } from "../../../integrations/types/task-integrations.types";
import { AppOptionsComponent } from "./options.component";

describe("AppOptionsComponent", () => {
  let component: AppOptionsComponent;
  let fixture: ComponentFixture<AppOptionsComponent>;

  const integrationResult: TaskIntegrationResult = {
    authUrl: null,
    message: "Task sent to Google Calendar.",
    metadata: null,
    provider: "google-calendar",
    success: true,
    taskId: "task-1",
  };

  const taskIntegrationsService = jasmine.createSpyObj<TaskIntegrationsService>("TaskIntegrationsService", [
    "attachGoogleDrive",
    "connectGoogleCalendar",
    "redirectToAuth",
    "sendToNotion",
  ]);

  beforeEach(async () => {
    taskIntegrationsService.connectGoogleCalendar.and.returnValue(of(integrationResult));
    taskIntegrationsService.sendToNotion.and.returnValue(of({ ...integrationResult, provider: "notion" }));
    taskIntegrationsService.attachGoogleDrive.and.returnValue(of({ ...integrationResult, provider: "google-drive" }));

    await TestBed.configureTestingModule({
      imports: [AppOptionsComponent],
      providers: [{ provide: TaskIntegrationsService, useValue: taskIntegrationsService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppOptionsComponent);
    component = fixture.componentInstance;
  });

  it("creates the component", () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it("emits the selected provider when a task is available", () => {
    spyOn(component.onOptionSelected, "emit");
    fixture.componentRef.setInput("taskId", "task-1");
    fixture.detectChanges();

    component.connect("google-calendar");

    expect(component.onOptionSelected.emit).toHaveBeenCalledWith("google-calendar");
    expect(taskIntegrationsService.connectGoogleCalendar).toHaveBeenCalledWith("task-1");
  });
});
